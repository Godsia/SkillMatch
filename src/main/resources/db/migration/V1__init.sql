CREATE TABLE users (
                       id           BIGSERIAL PRIMARY KEY,
                       email        VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255),
                       first_name   VARCHAR(255),
                       last_name    VARCHAR(255),
                       gender       VARCHAR(20),
                       birth_date   DATE,
                       status       VARCHAR(30) NOT NULL,
                       created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- email verification codes
CREATE TABLE email_verification_codes (
                                          id         BIGSERIAL PRIMARY KEY,
                                          user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                          code       VARCHAR(6) NOT NULL,
                                          expires_at TIMESTAMP NOT NULL,
                                          used       BOOLEAN NOT NULL DEFAULT FALSE,
                                          created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_codes_user ON email_verification_codes(user_id);
CREATE INDEX idx_email_codes_code ON email_verification_codes(code);

-- skills
CREATE TABLE skills (
                        id   BIGSERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL UNIQUE
);

-- user_skills
CREATE TABLE user_skills (
                             id       BIGSERIAL PRIMARY KEY,
                             user_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                             skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ux_user_skill ON user_skills(user_id, skill_id);

-- preferences
CREATE TABLE user_preferences (
                                  user_id          BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                  work_formats     TEXT,              -- будем хранить как CSV (MVP)
                                  experience_level VARCHAR(30),
                                  salary_from      INT,
                                  salary_to        INT,
                                  salary_period    VARCHAR(20)
);

-- swipes
CREATE TABLE swipes (
                        id          BIGSERIAL PRIMARY KEY,
                        user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        vacancy_id  BIGINT NOT NULL,
                        status      VARCHAR(20) NOT NULL,
                        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_swipe_user_vacancy ON swipes(user_id, vacancy_id);