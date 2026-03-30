#!/bin/bash
# Usage: ./scripts/release.sh 0.1.0
VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

echo "Releasing OpenTang v$VERSION..."

# Update package.json version
npm version $VERSION --no-git-tag-version

# Update Cargo.toml version
sed -i "s/^version = \".*\"/version = \"$VERSION\"/" src-tauri/Cargo.toml

# Commit and tag
git add package.json src-tauri/Cargo.toml
git commit -m "chore: bump version to $VERSION"
git tag "v$VERSION"
git push && git push --tags

echo "✅ v$VERSION tagged and pushed. GitHub Actions will build releases."
