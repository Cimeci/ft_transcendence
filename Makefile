.PHONY: all up build elk back front fullstack down down-v clean look-logs cat-logs

################################################################################
#	USED CONTAINERS															   #
################################################################################
ELK_CONTAINERS		=	filebeat logstash ilm-manager es01 kibana certs kibana-dashboards
BACKEND_CONTAINERS	=	gateway auth tournament	user game websocket reverse-proxy
FRONTEND_CONTAINERS	=	frontend
MONITOR_CONTAINERS	= 	prometheus alertmanager cadvisor es_exporter telegraf grafana

################################################################################
#	RECIPES																	   #
################################################################################

all: build up

up: prom-crypt
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

monitor: prom-crypt
	docker compose up --build $(MONITOR_CONTAINERS)

down:
	docker compose down

down-v:
	docker compose down -v --remove-orphans

clean: down-v
	rm -f backend/src/auth/data/user.sqlite
	rm -f backend/src/game/data/game.sqlite
	rm -f backend/src/tournament/data/tournament.sqlite
	rm -f backend/src/user/data/user.sqlite

prom-crypt:
	python3 ./monitoring/generate_hash.py

look-logs:
	sudo ls -l /var/lib/docker/volumes/ft_transcendence_app_logs/_data

cat-logs:
	sudo find /var/lib/docker/volumes/ft_transcendence_app_logs/_data -name "*.log" -exec cat {} \;

help:
	@echo "Availables commands are"
	@cat Makefile | head -1 | sed -n 's/^\.PHONY:[[:space:]]*//p'

