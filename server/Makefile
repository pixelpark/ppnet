PROJECT = ppnet-server
REGISTRY = registry.giantswarm.io
USERNAME :=  $(shell swarm user)

docker-build:
	cd ..; \
	docker build -f server/Dockerfile-server -t $(REGISTRY)/$(USERNAME)/$(PROJECT) .

docker-run:
	docker run -p 8000:8000 -it --link couchdb:db --rm $(REGISTRY)/$(USERNAME)/$(PROJECT)

docker-build-couchdb:
	docker build -f Dockerfile-couchdb -t $(REGISTRY)/$(USERNAME)/couchdb .

docker-run-couchdb:
	 docker run -d --name couchdb $(REGISTRY)/$(USERNAME)/couchdb

docker-push: docker-build
	docker push $(REGISTRY)/$(USERNAME)/$(PROJECT)

docker-pull:
	docker pull $(REGISTRY)/$(USERNAME)/$(PROJECT)

swarm-up: docker-push
	swarm up swarm.json --var=username=$(USERNAME)