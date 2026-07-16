.DEFAULT_GOAL := help
.PHONY: help install clean dev build start lint format check db-up db-down db-migrate db-generate db-studio db-seed

# ─── Setup ──────────────────────────────────────────────
install: ## Install dependencies
	pnpm install

clean: ## Remove build artifacts and deps
	rm -rf .next node_modules

# ─── Development ────────────────────────────────────────
dev: ## Run dev server
	pnpm dev

# ─── Build & Run ────────────────────────────────────────
build: ## Build for production
	pnpm build

start: build ## Build then start production server
	pnpm start

# ─── Database — container ───────────────────────────────
db-up: ## Start local Postgres via Docker (requires DATABASE_URL in .env)
	docker run -d --name banner-maker-pg \
		-e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=banner_maker \
		-p 5432:5432 postgres:16-alpine

db-down: ## Stop and remove the local Postgres container
	docker rm -f banner-maker-pg

# ─── Database — Prisma ──────────────────────────────────
db-migrate: ## Apply committed migrations (prisma migrate deploy)
	pnpm exec prisma migrate deploy

db-generate: ## Regenerate the Prisma client
	pnpm exec prisma generate

db-studio: ## Open Prisma Studio
	pnpm exec prisma studio

db-seed: ## Seed the database (requires SEEDER_USER_PASSWORD in .env)
	pnpm db:seed

# ─── Quality ────────────────────────────────────────────
lint: ## Run eslint
	pnpm lint

check: lint ## Run all quality checks
	pnpm exec tsc --noEmit

# ─── Help ───────────────────────────────────────────────
help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "}; \
		/^# ─── .* ───+$$/ {gsub(/# ─── | ─+$$/, ""); printf "\n\033[1m%s\033[0m\n", $$0; next} \
		/^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}' \
		$(MAKEFILE_LIST)
