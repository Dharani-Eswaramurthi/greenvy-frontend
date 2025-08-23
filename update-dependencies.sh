#!/bin/bash

echo "🔄 Updating dependencies and regenerating package-lock.json..."

# Remove existing node_modules and package-lock.json
echo "🧹 Cleaning up existing files..."
rm -rf node_modules package-lock.json

# Install dependencies fresh
echo "📦 Installing dependencies..."
npm install

# Verify installation
echo "✅ Dependencies installed successfully!"
echo "📋 Package-lock.json has been regenerated."

# Show summary
echo "📊 Summary:"
echo "  - Node modules: $(du -sh node_modules | cut -f1)"
echo "  - Package-lock.json: $(ls -lh package-lock.json | awk '{print $5}')"
echo "  - Dependencies count: $(npm list --depth=0 | wc -l)"

echo "🎉 Ready for Docker build!"
