package com.skillmatch.backend.vacancy.importer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.util.concurrent.atomic.AtomicBoolean;


@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "skillmatch.hh-import", name = "enabled", havingValue = "true")
public class HhImportScheduler {

    private final HhVacancyImporter importer;

    @Value("${skillmatch.hh-import.maxPages:0}")
    private int maxPages;

    @Value("${skillmatch.hh-import.maxDetails:0}")
    private int maxDetails;

    private final AtomicBoolean running = new AtomicBoolean(false);

    @Scheduled(
            fixedDelayString = "${skillmatch.hh-import.fixedDelayMs:1800000}",
            initialDelayString = "${skillmatch.hh-import.initialDelayMs:15000}"
    )
    public void scheduledImport() {
        if (!running.compareAndSet(false, true)) {
            log.info("HH scheduled import skipped: предыдущий запуск еще не завершен");
            return;
        }

        try {
            var st = importer.importDesignerDefaults(maxPages, maxDetails);
            log.info("HH scheduled import done: saved={}, skipped={}, captcha={}, rateLimited={}, errors={}",
                    st.saved, st.skippedAlreadyInDb, st.captcha, st.rateLimited, st.errors);
        } catch (Exception e) {
            log.error("HH scheduled import failed", e);
        } finally {
            running.set(false);
        }
    }
}
