#!/bin/bash

# Redis Setup Script for NotionWidgets Pro Phase 1
echo "🚀 Setting up Redis for NotionWidgets Pro Phase 1..."

# Check if Redis is already installed
if command -v redis-server &> /dev/null; then
    echo "✅ Redis is already installed"
else
    echo "📦 Installing Redis..."
    
    # Detect OS and install Redis
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install redis
        else
            echo "❌ Homebrew not found. Please install Redis manually: https://redis.io/download"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install redis-server
        elif command -v yum &> /dev/null; then
            sudo yum install redis
        else
            echo "❌ Package manager not found. Please install Redis manually: https://redis.io/download"
            exit 1
        fi
    else
        echo "❌ Unsupported OS. Please install Redis manually: https://redis.io/download"
        exit 1
    fi
fi

# Start Redis service
echo "🔄 Starting Redis service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start redis
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start redis
    sudo systemctl enable redis
fi

# Test Redis connection
echo "🧪 Testing Redis connection..."
if redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is running and responding"
else
    echo "❌ Redis is not responding. Please check the installation."
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "✅ Created .env.local. Please update it with your configuration."
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Redis setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local file with Redis configuration"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo ""
echo "To check cache status, visit: http://localhost:3000/api/admin/status"
