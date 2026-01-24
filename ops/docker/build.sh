#!/bin/bash

# build scheduler's docker image
docker build -t email-scheduler:1.0.0 . -f ops/docker/Dockerfile --no-cache


