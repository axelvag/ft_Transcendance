.PHONY: all build rebuild stop stop volumes fclean sh-% prune

all: volumes build up

build:
		docker-compose -fdocker-compose.yml --env-file .env build

up:
		docker-compose -f docker-compose.yml --env-file .env up -d

stop:
		docker-compose -f docker-compose.yml --env-file .env stop

volumes:
		# mkdir -p /var/lib/postgresql/data

fclean:
		docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans
		# rm -rf /var/lib/postgresql/data

rebuild:
		docker-compose -f docker-compose.yml --env-file .env build --no-cache

ps:
		docker-compose ps

re: fclean
	make rebuild
	make all

sh-%:
	docker compose -f docker-compose.yml exec $* /bin/sh

prune:
	-docker stop $$(docker ps -a -q)
	-docker rm $$(docker ps -a -q)
	-docker rmi $$(docker images -q)
	-docker volume rm $$(docker volume ls -q)
	-docker network rm $$(docker network ls -q) 2>/dev/null
	-docker buildx prune -a -f 2>/dev/null