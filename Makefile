PROFILE ?= prod

.PHONY: all
all: build up

.PHONY: build
build:
	docker compose -f docker-compose.yml --profile $(PROFILE) build

.PHONY: up
up:
	docker compose -f docker-compose.yml --profile $(PROFILE) up -d --build

.PHONY: stop
stop:
	docker compose -f docker-compose.yml --profile prod --profile dev stop

.PHONY: fclean
fclean: stop
	docker compose -f docker-compose.yml --profile prod --profile dev down -v --rmi all --remove-orphans

.PHONY: re
re: fclean
	@make --no-print-directory all

.PHONY: sh-%
sh-%:
	docker compose -f docker-compose.yml exec $* /bin/sh

.PHONY: prune
prune:
	-docker stop $$(docker ps -a -q)
	-docker rm $$(docker ps -a -q)
	-docker rmi $$(docker images -q)
	-docker volume rm $$(docker volume ls -q)
	-docker network rm $$(docker network ls -q) 2>/dev/null
	-docker buildx prune -a -f 2>/dev/null