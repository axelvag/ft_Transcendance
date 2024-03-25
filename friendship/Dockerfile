# Dockerfile du service friendship

FROM python:3.12-bookworm

RUN mkdir /friendshipApp
WORKDIR /friendshipApp

COPY requirements.txt /friendshipApp/
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY script_python.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/script_python.sh
ENTRYPOINT [ "script_python.sh" ]

EXPOSE 8003
# CMD ["tail", "-f", "/dev/null"]