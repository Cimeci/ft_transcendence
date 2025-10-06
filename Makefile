.PHONY: all up elk back front fullstack down down-v clear build status pre-start look-logs cat-logs

################################################################################
#	USED CONTAINERS															   #
################################################################################
ELK_CONTAINERS		=	filebeat logstash ilm-manager es01 kibana certs kibana-dashboards
BACKEND_CONTAINERS	=	gateway auth tournament	user game websocket
# FRONTEND_CONTAINERS	=	

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

# front: back
# 	docker compose up $(FRONTEND_CONTAINERS)

# fullstack: 

down:
	docker compose down

down-v:
	docker compose down -v

clear: down-v
	rm -f backend/src/auth/data/user.sqlite
	rm -f backend/src/game/data/game.sqlite
	rm -f backend/src/tournament/data/tournament.sqlite
	rm -f backend/src/user/data/user.sqlite

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

