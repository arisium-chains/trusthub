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

# Download PocketBase binary
install-pocketbase:
    #!/usr/bin/env bash
    echo "📥 Downloading PocketBase..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_darwin_amd64.zip -o pocketbase.zip
    else
        curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_linux_amd64.zip -o pocketbase.zip
    fi
    unzip pocketbase.zip && rm pocketbase.zip
    chmod +x pocketbase
    echo "✅ PocketBase installed! Run 'just pocketbase' to start"

# Run PocketBase publicly
pocketbase:
    #!/usr/bin/env bash
    if [ ! -f "./pocketbase" ]; then
        echo "❌ PocketBase not found. Run 'just install-pocketbase' first"
        exit 1
    fi
    echo "🚀 Starting PocketBase publicly on port 8090..."
    ./pocketbase serve --http=0.0.0.0:8090

# Run PocketBase with HTTPS
pocketbase-https:
    #!/usr/bin/env bash
    if [ ! -f "./pocketbase" ]; then
        echo "❌ PocketBase not found. Run 'just install-pocketbase' first"
        exit 1
    fi
    echo "🔒 Starting PocketBase with HTTPS..."
    ./pocketbase serve --http=0.0.0.0:80 --https=0.0.0.0:443

# Run PocketBase in background
pocketbase-bg:
    #!/usr/bin/env bash
    if [ ! -f "./pocketbase" ]; then
        echo "❌ PocketBase not found. Run 'just install-pocketbase' first"
        exit 1
    fi
    echo "🔄 Starting PocketBase in background..."
    nohup ./pocketbase serve --http=0.0.0.0:8090 > pocketbase.log 2>&1 &
    echo "PID: $!"

# View project info
info:
    @echo "📱 TrustHub - Decentralized Community Review Platform"
    @echo "🚀 Next.js app with TypeScript, Tailwind CSS, and shadcn/ui"
    @echo ""
    @echo "Available commands:"
    @echo "  just dev              - Start development server"
    @echo "  just build            - Build for production" 
    @echo "  just lint             - Run ESLint"
    @echo "  just clean            - Clean and reinstall dependencies"
    @echo "  just install-pocketbase - Download PocketBase binary"
    @echo "  just pocketbase       - Run PocketBase publicly"
    @echo "  just pocketbase-bg    - Run PocketBase in background"
    @echo ""
    @echo "Open http://localhost:3000 after running 'just dev'"