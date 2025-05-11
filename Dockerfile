# Используем официальный Python-образ
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект в контейнер
COPY . .

# Открываем порт (если нужен)
EXPOSE 8000

RUN python manage.py collectstatic --noinput

# Команда по умолчанию
CMD ["gunicorn", "project_name.wsgi:application", "--bind", "0.0.0.0:8000"]
