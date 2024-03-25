# Dockerfile du service auth

FROM python:3.12-bookworm

RUN mkdir /auth
WORKDIR /auth

COPY requirements.txt /auth/
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY /auth/. .

COPY script_python.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/script_python.sh
ENTRYPOINT [ "script_python.sh" ]

EXPOSE 8001
# CMD ["tail", "-f", "/dev/null"]