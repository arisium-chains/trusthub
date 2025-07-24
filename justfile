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
    echo "📥 Installing dependencies and downloading PocketBase..."
    
    # Install unzip if not available
    if ! command -v unzip &> /dev/null; then
        echo "Installing unzip..."
        if command -v apt-get &> /dev/null; then
            apt-get update && apt-get install -y unzip curl
        elif command -v yum &> /dev/null; then
            yum install -y unzip curl
        elif command -v apk &> /dev/null; then
            apk add unzip curl
        fi
    fi
    
    # Download PocketBase
    if [[ "$OSTYPE" == "darwin"* ]]; then
        curl -L "https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_darwin_amd64.zip" -o pocketbase.zip
    else
        curl -L "https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_linux_amd64.zip" -o pocketbase.zip
    fi
    
    # Check if download was successful
    if [ ! -f "pocketbase.zip" ] || [ ! -s "pocketbase.zip" ]; then
        echo "❌ Download failed. Trying alternative method..."
        rm -f pocketbase.zip
        wget "https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_linux_amd64.zip" -O pocketbase.zip
    fi
    
    # Extract and setup
    if [ -f "pocketbase.zip" ] && [ -s "pocketbase.zip" ]; then
        unzip -o pocketbase.zip
        rm pocketbase.zip
        chmod +x pocketbase
        echo "✅ PocketBase installed! Run 'just pocketbase' to start"
    else
        echo "❌ Failed to download PocketBase. Please check your internet connection."
        exit 1
    fi

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