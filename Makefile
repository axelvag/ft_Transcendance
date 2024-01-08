.PHONY: all build rebuild stop stop volumes fclean

all: volumes build up

build:
		sudo docker-compose -fdocker-compose.yml --env-file .env build

up:
		sudo docker-compose -f docker-compose.yml --env-file .env up -d

stop:
		sudo docker-compose -f docker-compose.yml --env-file .env stop
volumes:
		# sudo mkdir -p /home/avaganay/data/wordpress
		# sudo mkdir -p /home/avaganay/data/mariadb

fclean:
		sudo docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans
		# sudo rm -rf /home/avaganay/data/wordpress
		# sudo rm -rf /home/avaganay/data/mariadb

rebuild:
		sudo docker-compose -f docker-compose.yml --env-file .env build --no-cache

re: fclean rebuild all