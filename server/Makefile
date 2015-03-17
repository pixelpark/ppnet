PROJECT = ppnet-proxy
REGISTRY = registry.giantswarm.io
USERNAME :=  $(shell swarm user)

docker-build:
	docker build -t $(REGISTRY)/$(USERNAME)/$(PROJECT) .

docker-build-couchdb:
	docker build -f Dockerfile-couchdb -t $(REGISTRY)/$(USERNAME)/couchdb .

docker-run-couchdb:
	 docker run -d --name couchdb $(REGISTRY)/$(USERNAME)/couchdb

docker-run:
	docker run -p 80:80 --link couchdb:db --rm $(REGISTRY)/$(USERNAME)/$(PROJECT)

docker-push: docker-build
	docker push $(REGISTRY)/$(USERNAME)/$(PROJECT)

docker-pull:
	docker pull $(REGISTRY)/$(USERNAME)/$(PROJECT)

swarm-up: docker-push
	swarm up swarm.json --var=username=$(USERNAME)