# OpenTelemetry usage with OpenFGA's JS SDK

This example demonstrates how you can use OpenTelemetry with OpenFGA's JS SDK.

## Prerequisites

If you do not already have an OpenFGA instance running, you can start one using the following command:

```bash
docker run -d -p 8080:8080 openfga/openfga
```

You need to have an OpenTelemetry collector running to receive data. A pre-configured collector is available using Docker:

```bash
git clone https://github.com/ewanharris/opentelemetry-collector-dev-setup.git
cd opentelemetry-collector-dev-setup
docker-compose up -d
```

## Configure the example

You need to configure the example for your environment:

```bash
cp .env.example .env
```

Now edit the `.env` file and set the values as appropriate.

## Running the example

Begin by installing the required dependencies:

```bash
npm i
```

Next, run the example:

```bash
npm start
```