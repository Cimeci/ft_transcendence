.PHONY: all up elk back down build status pre-start look-logs

################################################################################
#	USED CONTAINERS															   #
################################################################################
ELK_CONTAINERS		=	filebeat logstash ilm-manager es01 kibana certs
BACKEND_CONTAINERS	=	gateway auth tournament	user game 

################################################################################
#	RECIPES																	   #
################################################################################
all: up

up:
	docker compose up

elk: pre-start
	docker compose up $(ELK_CONTAINERS)

back: pre-start
	docker compose up $(BACKEND_CONTAINERS)

down:
	docker compose down

down-v:
	docker compose down -v

build:
	docker compose build

status:
	docker ps

pre-start:
	docker compose up --no-start

look-logs:
	sudo ls -l /var/lib/docker/volumes/ft_transcendence_app_logs/_data

cat-logs:
	sudo find /var/lib/docker/volumes/ft_transcendence_app_logs/_data -name "*.log" -exec cat {} \;

