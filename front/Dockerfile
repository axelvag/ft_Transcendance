# build
FROM node:18.19.0 as build

ARG VITE_BASE_URL
ARG VITE_WS_BASE_URL
ARG VITE_OAUTH_AUTHORIZE_URL

ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL
ENV VITE_OAUTH_AUTHORIZE_URL=$VITE_OAUTH_AUTHORIZE_URL

WORKDIR /app
COPY ./app/package*.json ./
RUN npm install

RUN npm install dotenv

COPY ./app .
RUN npm run build

# serve
FROM nginx:1.25.3
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]