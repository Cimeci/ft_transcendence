.PHONY: all up build elk back front fullstack down down-v clean look-logs cat-logs

################################################################################
#	USED CONTAINERS															   #
################################################################################
ELK_CONTAINERS		=	filebeat logstash ilm-manager es01 kibana certs kibana-dashboards
BACKEND_CONTAINERS	=	gateway auth tournament	user game websocket
FRONTEND_CONTAINERS	=	frontend

################################################################################
#	RECIPES																	   #
################################################################################

all: build up

up:
	docker compose up

build:
	docker compose build

elk:
	docker compose up $(ELK_CONTAINERS)

back:
	docker compose up --build $(BACKEND_CONTAINERS)

front:
	 docker compose up --build $(FRONTEND_CONTAINERS)

fullstack:
	 docker compose up --build $(BACKEND_CONTAINERS) $(FRONTEND_CONTAINERS)

down:
	docker compose down

down-v:
	docker compose down -v --remove-orphans

clean: down-v
	rm -f backend/src/auth/data/user.sqlite
	rm -f backend/src/game/data/game.sqlite
	rm -f backend/src/tournament/data/tournament.sqlite
	rm -f backend/src/user/data/user.sqlite

look-logs:
	sudo ls -l /var/lib/docker/volumes/ft_transcendence_app_logs/_data

cat-logs:
	sudo find /var/lib/docker/volumes/ft_transcendence_app_logs/_data -name "*.log" -exec cat {} \;

