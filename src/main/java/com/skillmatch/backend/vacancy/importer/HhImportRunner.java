package com.skillmatch.backend.vacancy.importer;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HhImportRunner implements ApplicationRunner {

    private final HhVacancyImporter importer;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (args.containsOption("import-hh-design")) {
            int maxPages = optInt(args, "maxPages", 0);
            int maxDetails = optInt(args, "maxDetails", 0);

            var st = importer.importDesignerDefaults(maxPages, maxDetails);
            System.out.println("HH import (designer) done: saved=" + st.saved +
                    ", skipped=" + st.skippedAlreadyInDb +
                    ", captcha=" + st.captcha +
                    ", rateLimited=" + st.rateLimited +
                    ", errors=" + st.errors);
            return;
        }

        if (!args.containsOption("import-hh")) return;

        String text = optStr(args, "text", "дизайн");
        int area = optInt(args, "area", 1);
        int perPage = optInt(args, "perPage", 50);
        int maxPages = optInt(args, "maxPages", 0);
        int maxDetails = optInt(args, "maxDetails", 0);

        var st = importer.importByText(text, area, perPage, maxPages, maxDetails);

        System.out.println("HH import done: saved=" + st.saved +
                ", skipped=" + st.skippedAlreadyInDb +
                ", captcha=" + st.captcha +
                ", rateLimited=" + st.rateLimited +
                ", errors=" + st.errors);
    }

    private static String optStr(ApplicationArguments args, String name, String def) {
        var values = args.getOptionValues(name);
        return (values != null && !values.isEmpty() && values.get(0) != null) ? values.get(0) : def;
    }

    private static int optInt(ApplicationArguments args, String name, int def) {
        var values = args.getOptionValues(name);
        return (values != null && !values.isEmpty() && values.get(0) != null) ? Integer.parseInt(values.get(0)) : def;
    }
}
