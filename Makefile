.PHONY: dev db:push db:studio db:seed build start docker-up docker-down docker-build help

dev:
	bun run dev

db:push:
	bun run db:push

db:studio:
	bun run db:studio

db:seed:
	bun prisma db seed

build:
	bun run build

start:
	bun run start

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

help:
	@echo "Available commands:"
	@echo "  make dev          - Start Next.js dev server"
	@echo "  make db:push      - Push Prisma schema to database"
	@echo "  make db:studio    - Open Prisma Studio"
	@echo "  make db:seed      - Seed database with demo data"
	@echo "  make build        - Build for production"
	@echo "  make start        - Start production server"
	@echo "  make docker-up    - Start Docker containers"
	@echo "  make docker-down  - Stop Docker containers"

.DEFAULT_GOAL := help
