# Install dependencies with --no-cache-dir to reduce size
pip3 install --no-cache-dir -r requirements.txt

python3 manage.py makemigrations
python3 manage.py migrate
# Collect static files and apply migrations
python3 manage.py collectstatic --noinput