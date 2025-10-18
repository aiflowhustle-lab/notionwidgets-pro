#!/bin/bash

# Deploy static embed wrapper for Notion iPad compatibility
echo "🚀 Deploying static embed wrapper for Notion iPad compatibility..."

# Create a temporary directory for the embed project
TEMP_DIR="notion-widget-embed"
mkdir -p $TEMP_DIR

# Copy the embed HTML file
cp public/embed/index.html $TEMP_DIR/index.html

# Copy the Vercel config
cp vercel-embed.json $TEMP_DIR/vercel.json

# Navigate to temp directory
cd $TEMP_DIR

# Initialize git repo
git init
git add .
git commit -m "Initial commit: Notion widget embed wrapper"

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
npx vercel --prod --yes

# Get the deployment URL
echo "✅ Deployment complete!"
echo "🔗 Your embed URL will be shown above"
echo ""
echo "📱 To use in Notion:"
echo "1. Copy the HTTPS URL from above"
echo "2. In Notion, type /embed"
echo "3. Paste the URL"
echo "4. The widget should now work on iPad Notion app!"
echo ""
echo "🛠️ If you need to update the widget URL, edit index.html and redeploy"

# Clean up
cd ..
rm -rf $TEMP_DIR

echo "✨ Done! Your embed wrapper is ready for Notion iPad app."
