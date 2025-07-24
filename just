#!/bin/bash

# TrustHub Quick Commands
# Usage: ./just <command>

case "$1" in
  "install-pb")
    echo "📥 Downloading PocketBase..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_darwin_amd64.zip -o pocketbase.zip
    else
      curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_linux_amd64.zip -o pocketbase.zip
    fi
    unzip pocketbase.zip && rm pocketbase.zip
    chmod +x pocketbase
    echo "✅ PocketBase installed! Run './just pocketbase' to start"
    ;;
  "pocketbase"|"pb")
    if [ ! -f "./pocketbase" ]; then
      echo "❌ PocketBase not found. Run './just install-pb' first"
      exit 1
    fi
    echo "🚀 Starting PocketBase publicly on port 8090..."
    ./pocketbase serve --http=0.0.0.0:8090
    ;;
  "pb-https")
    if [ ! -f "./pocketbase" ]; then
      echo "❌ PocketBase not found. Run './just install-pb' first"
      exit 1
    fi
    echo "🔒 Starting PocketBase with HTTPS..."
    ./pocketbase serve --http=0.0.0.0:80 --https=0.0.0.0:443
    ;;
  "pb-bg")
    if [ ! -f "./pocketbase" ]; then
      echo "❌ PocketBase not found. Run './just install-pb' first"
      exit 1
    fi
    echo "🔄 Starting PocketBase in background..."
    nohup ./pocketbase serve --http=0.0.0.0:8090 > pocketbase.log 2>&1 &
    echo "PID: $!"
    ;;
  "dev")
    echo "🛠️ Starting development server..."
    npm run dev
    ;;
  "build")
    echo "🏗️ Building TrustHub..."
    npm run build
    ;;
  "lint")
    echo "🔍 Running linter..."
    npm run lint
    ;;
  "deploy")
    echo "🚀 Building and starting production..."
    npm run build && npm start
    ;;
  *)
    echo "TrustHub Quick Commands:"
    echo "  ./just install-pb   - Download and install PocketBase"
    echo "  ./just pocketbase   - Run PocketBase publicly"
    echo "  ./just pb-https     - Run PocketBase with HTTPS"
    echo "  ./just pb-bg        - Run PocketBase in background"
    echo "  ./just dev          - Start development server"
    echo "  ./just build        - Build for production"
    echo "  ./just lint         - Run linter"
    echo "  ./just deploy       - Build and start production"
    ;;
esac