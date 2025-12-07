#!/bin/bash

docker compose -f infra/docker/docker-compose.dev.yml --profile stack up -d --wait
./infra/scripts/init_db.sh

