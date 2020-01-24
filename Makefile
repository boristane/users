.PHONY: test local

PIPELINE_LABEL?=local

test:
	./run-test.sh

local:
	./run-local.sh