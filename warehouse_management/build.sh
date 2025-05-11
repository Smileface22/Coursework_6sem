# Install dependencies with --no-cache-dir to reduce size
python3 -m pip install -r requirements.txt

python3 manage.py makemigrations
python3 manage.py migrate
# Collect static files and apply migrations
python3 manage.py collectstatic --noinput