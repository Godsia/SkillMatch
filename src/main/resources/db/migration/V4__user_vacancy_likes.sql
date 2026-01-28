CREATE TABLE IF NOT EXISTS user_vacancy_likes (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vacancy_id BIGINT NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,

    liked BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT ux_user_vacancy_like UNIQUE (user_id, vacancy_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vacancy_likes_user_id ON user_vacancy_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vacancy_likes_vacancy_id ON user_vacancy_likes(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_user_vacancy_likes_liked ON user_vacancy_likes(liked);
