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
    set -e  # Exit on any error
    
    echo "📥 Installing dependencies and downloading PocketBase..."
    
    # Clean up any previous failed attempts
    rm -f pocketbase.zip pocketbase
    
    # Install required tools
    if ! command -v unzip &> /dev/null || ! command -v curl &> /dev/null; then
        echo "📦 Installing required packages..."
        if command -v apt-get &> /dev/null; then
            apt-get update && apt-get install -y unzip curl wget
        elif command -v yum &> /dev/null; then
            yum install -y unzip curl wget
        elif command -v apk &> /dev/null; then
            apk add unzip curl wget
        else
            echo "❌ Could not find package manager to install dependencies"
            exit 1
        fi
    fi
    
    # Determine download URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        URL="https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_darwin_amd64.zip"
    else
        URL="https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_linux_amd64.zip"
    fi
    
    echo "🌐 Downloading from: $URL"
    
    # Try multiple download methods
    DOWNLOAD_SUCCESS=false
    
    # Method 1: curl with follow redirects
    echo "📁 Attempting download with curl..."
    if curl -L -f --connect-timeout 30 --max-time 300 "$URL" -o pocketbase.zip; then
        if [ -f "pocketbase.zip" ] && [ -s "pocketbase.zip" ]; then
            echo "✅ Download successful with curl"
            DOWNLOAD_SUCCESS=true
        fi
    fi
    
    # Method 2: wget if curl failed
    if [ "$DOWNLOAD_SUCCESS" = false ]; then
        echo "📁 Trying wget..."
        rm -f pocketbase.zip
        if wget --timeout=30 --tries=3 "$URL" -O pocketbase.zip; then
            if [ -f "pocketbase.zip" ] && [ -s "pocketbase.zip" ]; then
                echo "✅ Download successful with wget"
                DOWNLOAD_SUCCESS=true
            fi
        fi
    fi
    
    # Method 3: Direct binary download as fallback
    if [ "$DOWNLOAD_SUCCESS" = false ]; then
        echo "📁 Trying direct binary download..."
        rm -f pocketbase.zip
        BINARY_URL="https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_linux_amd64.zip"
        if curl -L -f --connect-timeout 30 --max-time 300 "$BINARY_URL" -o pocketbase.zip; then
            if [ -f "pocketbase.zip" ] && [ -s "pocketbase.zip" ]; then
                echo "✅ Download successful with direct URL"
                DOWNLOAD_SUCCESS=true
            fi
        fi
    fi
    
    if [ "$DOWNLOAD_SUCCESS" = false ]; then
        echo "❌ All download methods failed. Manual installation required:"
        echo "1. Visit: https://github.com/pocketbase/pocketbase/releases/v0.21.5"
        echo "2. Download pocketbase_0.21.5_linux_amd64.zip"
        echo "3. Extract and place 'pocketbase' binary in this directory"
        exit 1
    fi
    
    # Verify zip file
    echo "🔍 Verifying downloaded file..."
    if ! unzip -t pocketbase.zip > /dev/null 2>&1; then
        echo "❌ Downloaded file is corrupted. File info:"
        ls -la pocketbase.zip
        file pocketbase.zip
        echo "Try again or download manually."
        exit 1
    fi
    
    # Extract
    echo "📦 Extracting PocketBase..."
    if unzip -o pocketbase.zip; then
        rm pocketbase.zip
        if [ -f "pocketbase" ]; then
            chmod +x pocketbase
            echo "✅ PocketBase successfully installed!"
            echo "📍 Binary location: $(pwd)/pocketbase"
            echo "🚀 Run 'just pocketbase' to start"
            ./pocketbase --version
        else
            echo "❌ Extraction succeeded but pocketbase binary not found"
            ls -la
            exit 1
        fi
    else
        echo "❌ Failed to extract pocketbase.zip"
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