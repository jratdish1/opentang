#!/bin/bash
# ============================================================================
# GITHUB SYNC SCRIPT
# Automatically commits and pushes all changes to the remote repository.
# Usage: ./github_sync.sh [optional commit message]
# ============================================================================

set -euo pipefail

WORKSPACE="/home/deployer/crypto_deployment"
cd "${WORKSPACE}"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Error: Git not initialized in ${WORKSPACE}. Run 'git init' first."
    exit 1
fi

# Stage all changes
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Commit with provided message or auto-generated one
MSG="${1:-Auto-sync: $(date +'%Y-%m-%d %H:%M:%S')}"
git commit -m "${MSG}"

# Push to remote
git push origin main

echo "Sync complete: ${MSG}"
