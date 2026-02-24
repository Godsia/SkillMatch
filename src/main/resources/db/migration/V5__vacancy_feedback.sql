CREATE TABLE IF NOT EXISTS vacancy_feedback (
    id         BIGSERIAL PRIMARY KEY,

    user_id    BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vacancy_id BIGINT  NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,

    liked_matching BOOLEAN NOT NULL,
    rating         INT     NOT NULL CHECK (rating BETWEEN 1 AND 5),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT ux_vacancy_feedback UNIQUE (user_id, vacancy_id)
);

CREATE INDEX IF NOT EXISTS idx_vacancy_feedback_user_id ON vacancy_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_vacancy_feedback_vacancy_id ON vacancy_feedback(vacancy_id);

