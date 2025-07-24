#!/bin/bash

# TrustHub Quick Commands
# Usage: ./just <command>

case "$1" in
  "pocketbase"|"pb")
    echo "🚀 Starting PocketBase publicly on port 8090..."
    ./pocketbase serve --http=0.0.0.0:8090
    ;;
  "pb-https")
    echo "🔒 Starting PocketBase with HTTPS..."
    ./pocketbase serve --http=0.0.0.0:80 --https=0.0.0.0:443
    ;;
  "pb-bg")
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
    echo "  ./just pocketbase   - Run PocketBase publicly"
    echo "  ./just pb-https     - Run PocketBase with HTTPS"
    echo "  ./just pb-bg        - Run PocketBase in background"
    echo "  ./just dev          - Start development server"
    echo "  ./just build        - Build for production"
    echo "  ./just lint         - Run linter"
    echo "  ./just deploy       - Build and start production"
    ;;
esac