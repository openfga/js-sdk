.PHONY: help install build test lint lint-fix audit clean all

# Default target
help:
	@echo "Available targets:"
	@echo "  make install         - Install dependencies"
	@echo "  make build           - Build the project"
	@echo "  make test            - Run tests"
	@echo "  make lint            - Run linter"
	@echo "  make lint-fix        - Run linter with auto-fix"
	@echo "  make audit           - Audit dependencies for vulnerabilities"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make all             - Install, build, lint, and test"

# Install dependencies
install:
	npm ci

# Build the project
build:
	npm run build

# Run tests
test:
	npm test

# Run linter
lint:
	npm run lint

# Run linter with auto-fix
lint-fix:
	npm run lint:fix

# Audit dependencies
audit:
	npm audit

# Clean build artifacts
clean:
	rm -rf dist/

# Run all checks (install, build, lint, test)
all: install build lint audit clean test
	@echo "All checks passed!"
 