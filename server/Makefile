PROJECT = ppnet-server
REGISTRY = registry.giantswarm.io
USERNAME :=  $(shell swarm user)
#change this to your local docker daemon
PPNET_SERVER_URL = 192.168.59.103:8000

docker-build-server:
	cd ..; \
	docker build -f server/Dockerfile-server -t $(REGISTRY)/$(USERNAME)/$(PROJECT) .

docker-run-server:
	docker run -p 8000:8000 -it --link couchdb:db --rm -e PPNET_SERVER_URL=$(PPNET_SERVER_URL) $(REGISTRY)/$(USERNAME)/$(PROJECT)

docker-build-couchdb:
	docker build -f Dockerfile-couchdb -t $(REGISTRY)/$(USERNAME)/couchdb .

docker-run-couchdb:
	 docker run -d --name couchdb $(REGISTRY)/$(USERNAME)/couchdb

docker-push: docker-build-server docker-build-couchdb 
	docker push $(REGISTRY)/$(USERNAME)/$(PROJECT)
	docker push $(REGISTRY)/$(USERNAME)/couchdb

swarm-up: docker-push
	swarm up swarm.json --var=username=$(USERNAME)