PROJECT = ppnet-server
REGISTRY = registry.giantswarm.io
USERNAME :=  $(shell swarm user)
DOMAIN = ppnet-$(USERNAME).gigantic.io
MY_IP = $(shell boot2docker ip)
PPNET_SERVER_URL = http://$(MY_IP):8000

docker-build-server:
	cd ..; \
	docker build -q -f server/Dockerfile-server -t $(REGISTRY)/$(USERNAME)/$(PROJECT) .

docker-run-server:
	@echo "ppnet is running at $(PPNET_SERVER_URL)"
	docker run -p 8000:8000 -it --link couchdb:db --rm -e PPNET_SERVER_URL=$(PPNET_SERVER_URL) $(REGISTRY)/$(USERNAME)/$(PROJECT)

docker-stop-couchdb:
	docker stop couchdb
	docker rm couchdb
	@echo "Stopped and removed couchdb container."

docker-build-couchdb:
	docker build -q -f Dockerfile-couchdb -t $(REGISTRY)/$(USERNAME)/couchdb .

docker-run-couchdb:
	docker run -d --name couchdb $(REGISTRY)/$(USERNAME)/couchdb

run-local: docker-run-couchdb docker-build-server docker-run-server

docker-push: docker-build-server docker-build-couchdb
	docker push $(REGISTRY)/$(USERNAME)/couchdb
	docker push $(REGISTRY)/$(USERNAME)/$(PROJECT)

swarm-up: docker-push
	swarm up swarm.json --var=username=$(USERNAME) --var=domain=$(DOMAIN)
	@echo "ppnet is running at http://$(DOMAIN)"
