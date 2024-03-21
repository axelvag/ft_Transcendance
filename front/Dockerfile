# build
FROM node:18.19.0 as build

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