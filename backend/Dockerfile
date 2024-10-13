FROM python:3.12

# Installing netcat (needed for wait-for-it.sh)
RUN apt-get update && apt-get install -y netcat-openbsd

WORKDIR /app

COPY ../wait-for-it.sh /wait-for-it.sh

RUN chmod +x /wait-for-it.sh

COPY Pipfile Pipfile.lock ./

RUN pip install pipenv && pipenv install --deploy --ignore-pipfile

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "/wait-for-it.sh db:3306 -- pipenv run python manage.py migrate && pipenv run python manage.py runserver 0.0.0.0:8000"]


