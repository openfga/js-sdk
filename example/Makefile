all: run

project_name=example1
openfga_version=latest

setup:
	cd "${project_name}/" && npm install && cd -

run:
	cd "${project_name}" && \
		npm run run-example

run-openfga:
	docker pull docker.io/openfga/openfga:${openfga_version} && \
		docker run -p 8080:8080 docker.io/openfga/openfga:${openfga_version} run