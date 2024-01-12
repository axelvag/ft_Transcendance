.PHONY: all build rebuild stop stop volumes fclean

all: volumes build up

build:
		docker-compose -fdocker-compose.yml --env-file .env build

up:
		docker-compose -f docker-compose.yml --env-file .env up -d
		cd front && npm start

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