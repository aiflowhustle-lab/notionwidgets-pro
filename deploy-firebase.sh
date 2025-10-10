#!/bin/bash

# Deploy Firestore rules and indexes
echo "Deploying Firestore rules and indexes..."

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

echo "Firebase deployment complete!"
