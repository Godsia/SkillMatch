package com.skillmatch.backend.vacancy.importer;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatch.backend.user.model.Skill;
import com.skillmatch.backend.user.repo.SkillRepository;
import com.skillmatch.backend.vacancy.model.Vacancy;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HhVacancyImporter {

    private static final String SOURCE = "hh";


    private static final String BASE = "https://api.hh.ru/vacancies";

    private static final String CLIENT_ID = "VCOSMUS54NDLBQULQLLVE521J3T4CNHJUV12BSVIC8JQ47FQJ44FV3CJ7OEDV4GP";
    private static final String CLIENT_SECRET = "T2AAP5ICNAOPDE2RARB4FGCOF96CA9DL68270JJDN9TF4RP67ORAEL7AIABKURG4";
    private static final String TOKEN_URL = "https://hh.ru/oauth/token";

    private static final int DEFAULT_AREA = 1;
    private static final int DEFAULT_PER_PAGE = 50;

    private static final String UA = "SkillMatchMVP/1.0 (+contact: marattatarsao@gmail.com)";

    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private int captchaStreak = 0;
    private int rateLimitStreak = 0;

    private String accessToken = null;
    private Instant tokenExpiresAt = Instant.MIN;

    private static final int DETAIL_SLEEP_BASE_MS = 1200;
    private static final int DETAIL_SLEEP_JITTER_MS = 900;

    private static final int CAPTCHA_BACKOFF_BASE_MS = 10_000;
    private static final int CAPTCHA_BACKOFF_MAX_MS  = 120_000;

    private static final int RL_BACKOFF_BASE_MS = 8_000;
    private static final int RL_BACKOFF_MAX_MS  = 120_000;

    private final VacancyRepository vacancyRepository;
    private final SkillRepository skillRepository;

    private HttpRequest.Builder withHHHeaders(HttpRequest.Builder b) {
        ensureToken();
        b.header("User-Agent", UA)
         .header("HH-User-Agent", UA)
         .header("Accept", "application/json");
        if (accessToken != null) {
            b.header("Authorization", "Bearer " + accessToken);
        }
        return b;
    }

    private synchronized void ensureToken() {
        if (accessToken != null && Instant.now().isBefore(tokenExpiresAt.minusSeconds(60))) {
            return;
        }
        try {
            String body = "grant_type=client_credentials&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(TOKEN_URL))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("User-Agent", UA)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                TokenResponse tr = MAPPER.readValue(response.body(), TokenResponse.class);
                accessToken = tr.access_token;
                tokenExpiresAt = Instant.now().plusSeconds(tr.expires_in);
            } else {
                System.err.println("Failed to get HH token: " + response.statusCode() + " " + response.body());
            }
        } catch (Exception e) {
            System.err.println("Error fetching HH token: " + e.getMessage());
        }
    }

    public ImportStats importDesignerDefaults(int maxPages, int maxDetails) throws IOException, InterruptedException {

        return importByText("дизайн", DEFAULT_AREA, DEFAULT_PER_PAGE, maxPages, maxDetails);
    }

    public ImportStats importByText(String text, int area, int perPage, int maxPages, int maxDetails)
            throws IOException, InterruptedException {

        if (perPage <= 0) perPage = DEFAULT_PER_PAGE;

        List<String> ids = searchVacanciesPaginated(text, area, perPage, maxPages);

        ImportStats st = new ImportStats();
        st.foundInSearch = ids.size();

        int processedNew = 0;

        for (String hhId : ids) {
            if (processedNew >= maxDetails) break;

            
            if (vacancyRepository.existsBySourceAndSourceVacancyId(SOURCE, hhId)) {
                st.skippedAlreadyInDb++;
                continue;
            }

            DetailFetchResult r = fetchDetailsAndSave(hhId);

            switch (r) {
                case SAVED -> {
                    st.saved++;
                    processedNew++;
                }
                case DUPLICATE -> st.skippedAlreadyInDb++;
                case CAPTCHA -> st.captcha++;
                case RATE_LIMIT -> st.rateLimited++;
                case ERROR -> st.errors++;
            }

            sleepJitter(DETAIL_SLEEP_BASE_MS, DETAIL_SLEEP_JITTER_MS);
        }

        st.processedNew = processedNew;
        return st;
    }

    private List<String> searchVacanciesPaginated(String text, int area, int perPage, int maxPages)
            throws IOException, InterruptedException {

        List<String> all = new ArrayList<>();
        Integer totalPagesFromApi = null;

        for (int page = 0; page < maxPages; page++) {
            SearchResponse sr = searchVacanciesRaw(text, area, perPage, page);

            if (totalPagesFromApi == null) {
                totalPagesFromApi = sr.pages;
            }

            List<VacancyItem> items = (sr.items != null) ? sr.items : List.of();
            for (VacancyItem it : items) {
                if (it != null && it.id != null) all.add(it.id);
            }

            if (totalPagesFromApi != null && page + 1 >= totalPagesFromApi) break;
            if (items.isEmpty()) break;

            sleepJitter(400, 300);
        }

        return all;
    }

    private SearchResponse searchVacanciesRaw(String text, int area, int perPage, int page)
            throws IOException, InterruptedException {

        String encoded = URLEncoder.encode(text, StandardCharsets.UTF_8);

        String url = BASE
                + "?text=" + encoded
                + "&search_field=name&search_field=description"
                + "&area=" + area
                + "&order_by=publication_time"
                + "&per_page=" + perPage
                + "&page=" + page;

        HttpRequest request = withHHHeaders(HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET())
                .build();

        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("HH search error: HTTP " + response.statusCode() + " " + response.body());
        }

        return MAPPER.readValue(response.body(), SearchResponse.class);
    }

    private DetailFetchResult fetchDetailsAndSave(String vacancyId) throws IOException, InterruptedException {
        String detailUrl = BASE + "/" + vacancyId;

        HttpRequest request = withHHHeaders(HttpRequest.newBuilder()
                .uri(URI.create(detailUrl))
                .GET())
                .build();

        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        int code = response.statusCode();
        String body = response.body();
        HttpHeaders headers = response.headers();

        if (code == 429) {
            rateLimitStreak++;
            captchaStreak = 0;

            long waitMs = retryAfterMs(headers)
                    .orElseGet(() -> backoffMs(rateLimitStreak, RL_BACKOFF_BASE_MS, RL_BACKOFF_MAX_MS));

            Thread.sleep(waitMs);
            return DetailFetchResult.RATE_LIMIT;
        } else {
            rateLimitStreak = 0;
        }

        if (code == 403 && body != null && body.contains("captcha_required")) {
            captchaStreak++;

            long waitMs = backoffMs(captchaStreak, CAPTCHA_BACKOFF_BASE_MS, CAPTCHA_BACKOFF_MAX_MS);
            Thread.sleep(waitMs);
            return DetailFetchResult.CAPTCHA;
        } else {
            captchaStreak = 0;
        }

        if (code != 200) {
            sleepJitter(1500, 1000);
            return DetailFetchResult.ERROR;
        }

        VacancyDetail detail = MAPPER.readValue(body, VacancyDetail.class);

        
        if (vacancyRepository.existsBySourceAndSourceVacancyId(SOURCE, vacancyId)) {
            return DetailFetchResult.DUPLICATE;
        }

        saveToDb(vacancyId, detail);
        return DetailFetchResult.SAVED;
    }

    @Transactional
    protected void saveToDb(String hhId, VacancyDetail detail) {

        String rawDesc = detail.description == null ? "" : detail.description;
        String plainDesc = stripHtml(rawDesc);

        String title = truncate(safe(detail.name), 250);
        String briefDesc = truncate(plainDesc, 250);

        String logoUrl = pickEmployerLogoUrl(detail.employer);

        String wFormat = null;
        if (detail.work_formats != null && !detail.work_formats.isEmpty()) {
            wFormat = detail.work_formats.stream()
                    .map(wf -> wf.id)
                    .filter(Objects::nonNull)
                    .collect(Collectors.joining(","));
        } else if (detail.schedule != null && "remote".equals(detail.schedule.id)) {
            wFormat = "remote";
        }

        String exp = detail.experience != null ? detail.experience.id : null;
        String empType = detail.employment_form != null ? detail.employment_form.id :
                (detail.employment != null ? detail.employment.id : null);
        String sch = detail.schedule != null ? detail.schedule.id : null;

        Vacancy v = Vacancy.builder()
                .source(SOURCE)
                .sourceVacancyId(hhId)
                .title(title)
                .description(rawDesc)
                .descriptionPlain(briefDesc)
                .url(detail.alternate_url)
                .employerName(detail.employer != null ? detail.employer.name : null)
                .employerLogoUrl(logoUrl)
                .areaName(detail.area != null ? detail.area.name : null)
                .publishedAt(parseInstant(detail.published_at))
                .salaryFrom(detail.salary != null ? detail.salary.from : null)
                .salaryTo(detail.salary != null ? detail.salary.to : null)
                .salaryCurrency(detail.salary != null ? detail.salary.currency : null)
                .salaryGross(detail.salary != null ? detail.salary.gross : null)
                .experienceLevel(exp)
                .employmentType(empType)
                .workSchedule(sch)
                .workFormat(wFormat)
                .build();

        if (detail.key_skills != null) {
            for (SkillDto s : detail.key_skills) {
                if (s == null || s.name == null || s.name.isBlank()) continue;

                String name = s.name.trim();
                Skill skill = skillRepository.findByNameIgnoreCase(name).orElseGet(() -> {
                    Skill ns = new Skill();
                    ns.setName(name);
                    return skillRepository.save(ns);
                });

                v.getSkills().add(skill);
            }
        }

        vacancyRepository.save(v);
    }

    private static Instant parseInstant(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return Instant.parse(s);
        } catch (Exception e) {
            return null;
        }
    }

    private static void sleepJitter(int baseMs, int jitterMs) throws InterruptedException {
        int extra = ThreadLocalRandom.current().nextInt(0, Math.max(1, jitterMs + 1));
        Thread.sleep(baseMs + extra);
    }

    private static long backoffMs(int streak, int baseMs, int maxMs) {
        long raw = (long) baseMs * Math.max(1, streak);
        long capped = Math.min(maxMs, raw);
        long jitter = ThreadLocalRandom.current().nextLong(0, 1500);
        return capped + jitter;
    }

    private static Optional<Long> retryAfterMs(HttpHeaders headers) {
        return headers.firstValue("Retry-After").flatMap(v -> {
            try {
                long seconds = Long.parseLong(v.trim());
                return Optional.of(seconds * 1000L);
            } catch (NumberFormatException e) {
                return Optional.empty();
            }
        });
    }

    private static String stripHtml(String s) {
        return s.replaceAll("(?s)<[^>]*>", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        String t = s.trim();
        if (t.length() <= max) return t;
        return t.substring(0, max);
    }

    private static String pickEmployerLogoUrl(Employer employer) {
        if (employer == null || employer.logo_urls == null) return null;
        
        String u240 = employer.logo_urls.s240;
        if (u240 != null && !u240.isBlank()) return u240;
        String orig = employer.logo_urls.original;
        if (orig != null && !orig.isBlank()) return orig;
        String u90 = employer.logo_urls.s90;
        if (u90 != null && !u90.isBlank()) return u90;
        return null;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class SearchResponse {
        public int found;
        public int pages;
        public List<VacancyItem> items;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class VacancyItem {
        public String id;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class VacancyDetail {
        public String name;
        public String description;
        public String alternate_url;
        public String published_at;

        public Employer employer;
        public Area area;
        public Salary salary;

        public IdNameItem experience;
        public IdNameItem employment;
        public IdNameItem employment_form;
        public IdNameItem schedule;

        @JsonProperty("work_format")
        public List<IdNameItem> work_formats;

        public List<SkillDto> key_skills;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class Employer {
        public String name;
        public LogoUrls logo_urls;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class LogoUrls {
        @JsonProperty("90")
        public String s90;

        @JsonProperty("240")
        public String s240;

        @JsonProperty("original")
        public String original;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class Area {
        public String name;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class Salary {
        public Integer from;
        public Integer to;
        public String currency;
        public Boolean gross;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class IdNameItem {
        public String id;
        public String name;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class SkillDto {
        public String name;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class TokenResponse {
        public String access_token;
        public long expires_in;
    }

    enum DetailFetchResult {
        SAVED,
        DUPLICATE,
        CAPTCHA,
        RATE_LIMIT,
        ERROR
    }

    public static class ImportStats {
        public int foundInSearch;
        public int processedNew;

        public int saved;
        public int skippedAlreadyInDb;

        public int captcha;
        public int rateLimited;
        public int errors;
    }
}
