#!/bin/bash

echo "🚀 Запуск бэкенда SkillMatch..."

# Проверка Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Ошибка: Docker daemon не запущен!"
    echo "   Пожалуйста, запустите Docker Desktop и попробуйте снова."
    exit 1
fi

echo "✅ Docker запущен"

# Запуск PostgreSQL
echo "📦 Запуск PostgreSQL..."
docker-compose up -d

# Ожидание готовности PostgreSQL
echo "⏳ Ожидание готовности PostgreSQL..."
sleep 5

# Проверка переменных окружения
if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  Предупреждение: JWT_SECRET не установлен"
    echo "   Установите переменную: export JWT_SECRET='your-secret-key-min-32-chars'"
fi

if [ -z "$MAIL_USERNAME" ] || [ -z "$MAIL_PASSWORD" ]; then
    echo "⚠️  Предупреждение: MAIL_USERNAME или MAIL_PASSWORD не установлены"
    echo "   Email верификация может не работать"
fi

# Запуск приложения
echo "🔨 Запуск Spring Boot приложения..."
./gradlew bootRun











