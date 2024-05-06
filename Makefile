PROFILE ?= prod

.PHONY: all build rebuild stop stop volumes fclean sh-% prune

all: volumes build up

build:
	docker compose -f docker-compose.yml --profile $(PROFILE) build

up:
	docker compose -f docker-compose.yml --profile $(PROFILE) up -d --build

stop:
	docker compose -f docker-compose.yml --profile prod --profile dev stop

volumes:
	# mkdir -p /var/lib/postgresql/data

fclean:
	@docker ps -a -q -f name=front | grep . > /dev/null; \
    if [ $$? -eq 0 ]; then \
        docker stop front > /dev/null 2>&1; \
        docker rm front > /dev/null 2>&1; \
    fi
	docker compose -f docker-compose.yml down -v --rmi all --remove-orphans

rebuild:
	docker compose -f docker-compose.yml build --no-cache

ps:
	docker compose ps

sh-%:
	docker compose -f docker-compose.yml exec $* /bin/sh

re: fclean
	@make --no-print-directory rebuild
	@make --no-print-directory all

sh-%:
	docker compose -f docker-compose.yml exec $* /bin/sh

prune:
	-docker stop $$(docker ps -a -q)
	-docker rm $$(docker ps -a -q)
	-docker rmi $$(docker images -q)
	-docker volume rm $$(docker volume ls -q)
	-docker network rm $$(docker network ls -q) 2>/dev/null
	-docker buildx prune -a -f 2>/dev/null