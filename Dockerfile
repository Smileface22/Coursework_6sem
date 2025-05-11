# Используем официальный образ Python
FROM python:3.11-slim

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости системы для MySQL
RUN apt-get update \
    && apt-get install -y build-essential libpq-dev gcc pkg-config libmysqlclient-dev \
    && apt-get clean

# Копируем файлы проекта
COPY . .

# Устанавливаем зависимости проекта
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Собираем статику (если нужно)
RUN python manage.py collectstatic --noinput

# Команда запуска
CMD ["gunicorn", "warehouse_management.wsgi:application", "--bind", "0.0.0.0:8000"]
