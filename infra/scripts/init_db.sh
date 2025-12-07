#!/bin/bash

cd "$(dirname "$0")/../.."

pnpm --filter accounts-service db:push
pnpm --filter orders-service db:push
