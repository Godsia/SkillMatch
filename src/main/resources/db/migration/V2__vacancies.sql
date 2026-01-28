-- vacancies
CREATE TABLE vacancies (
    id BIGSERIAL PRIMARY KEY,

    source VARCHAR(50) NOT NULL,
    source_vacancy_id VARCHAR(50) NOT NULL,

    title VARCHAR(500),
    description TEXT,
    description_plain TEXT,

    url TEXT,
    employer_name VARCHAR(500),
    area_name VARCHAR(255),

    published_at TIMESTAMP NULL,

    salary_from INT NULL,
    salary_to INT NULL,
    salary_currency VARCHAR(10) NULL,
    salary_gross BOOLEAN NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_vacancies_source_id ON vacancies(source, source_vacancy_id);

CREATE TABLE vacancy_skills (
    vacancy_id BIGINT NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    skill_id   BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (vacancy_id, skill_id)
);

CREATE INDEX idx_vacancies_published_at ON vacancies(published_at);
CREATE INDEX idx_vacancies_area_name ON vacancies(area_name);
