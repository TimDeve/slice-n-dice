.DEFAULT_GOAL := build

.PHONY: build
build:
	cargo build --release

.PHONY: clean
clean:
	rm -rf target

.PHONY: run
run:
	cargo run

.PHONY: test-unit
test-unit:
	cargo test

.PHONY: test-integration
test-integration:
	cargo test --tests integration --features integration-tests-with-db

.PHONY: test
test: test-unit test-integration

