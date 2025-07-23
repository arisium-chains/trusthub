# Justfile for DCRP (Decentralized Community Review Platform)
# Run `just` to see available commands

# Default recipe - show help
default:
    @just --list

# Install dependencies
install:
    npm install

# Start development server
dev:
    npm run dev

# Build for production
build:
    npm run build

# Start production server
start:
    npm run start

# Run linting
lint:
    npm run lint

# Run linting with auto-fix
lint-fix:
    npm run lint -- --fix

# Clean node_modules and reinstall
clean:
    rm -rf node_modules package-lock.json
    npm install

# Add a new shadcn/ui component
add-component component:
    npx shadcn@latest add {{component}}

# Type check the project
typecheck:
    npx tsc --noEmit

# Run all checks (lint + typecheck)
check:
    just lint
    just typecheck

# View project in browser (macOS)
open:
    open http://localhost:3000

# View project info
info:
    @echo "📱 DCRP - Decentralized Community Review Platform"
    @echo "🚀 Next.js app with TypeScript, Tailwind CSS, and shadcn/ui"
    @echo ""
    @echo "Available commands:"
    @echo "  just dev     - Start development server"
    @echo "  just build   - Build for production" 
    @echo "  just lint    - Run ESLint"
    @echo "  just clean   - Clean and reinstall dependencies"
    @echo ""
    @echo "Open http://localhost:3000 after running 'just dev'"