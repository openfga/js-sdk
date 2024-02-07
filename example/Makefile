all: run

project_name=example1
openfga_version=latest

setup:
	npm --prefix "${project_name}" install

run:
	npm --prefix "${project_name}" run start

run-openfga:
	docker pull docker.io/openfga/openfga:${openfga_version} && \
		docker run -p 8080:8080 docker.io/openfga/openfga:${openfga_version} run