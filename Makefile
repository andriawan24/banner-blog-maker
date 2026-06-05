.DEFAULT_GOAL := help
.PHONY: help install clean dev build start lint format check

# ─── Setup ──────────────────────────────────────────────
install: ## Install dependencies
	npm install

clean: ## Remove build artifacts and deps
	rm -rf .next node_modules

# ─── Development ────────────────────────────────────────
dev: ## Run dev server
	npm run dev

# ─── Build & Run ────────────────────────────────────────
build: ## Build for production
	npm run build

start: build ## Build then start production server
	npm run start

# ─── Quality ────────────────────────────────────────────
lint: ## Run eslint
	npm run lint

check: lint ## Run all quality checks
	npx tsc --noEmit

# ─── Help ───────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
