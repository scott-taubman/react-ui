# Makefile for Beer-garden UI

DOCKER_NAME    = bgio/react-ui
VERSION       ?= latest
SHORT_VERSION  = $(shell echo $(VERSION) | head -c 1)

.PHONY: clean clean-build clean-test help test deps
.DEFAULT_GOAL := help

# Misc
help:
	@python -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

deps: ## install javascript dependencies
	npm install


# Cleaning
clean-build: ## Remove dist
	rm -rf dist

clean-test: ## remove test and coverage artifacts
	echo "TODO: clean javascript tests"

clean-all: clean-build clean-test ## clean everything
	rm -f npm-debug.log
	rm -f npm-error.log

clean: clean-all ## alias of clean-all


# Linting
lint: ## check style with eslit
	npm run lint


# Testing / Coverage
test: ## run tests
	echo "TODO: run javascript tests"

coverage: ## check code coverage
	echo "TODO: run coverage reports"


# Packaging
package: clean ## builds distribution
	npm run build


# Docker
docker-build: package ## build docker image
	docker build -t $(DOCKER_NAME):latest .
	docker tag $(DOCKER_NAME):latest $(DOCKER_NAME):$(VERSION)
	docker tag $(DOCKER_NAME):latest $(DOCKER_NAME):$(SHORT_VERSION)

docker-build-unstable: package ## build nightly docker image
	docker build -t $(DOCKER_NAME):unstable .


# Publishing
publish-docker: docker-build ## push the docker image
	docker push $(DOCKER_NAME):latest
	docker push $(DOCKER_NAME):$(VERSION)
	docker push $(DOCKER_NAME):$(SHORT_VERSION)

publish-docker-unstable: docker-build-unstable ## push the unstable docker image
	docker push $(DOCKER_NAME):unstable
