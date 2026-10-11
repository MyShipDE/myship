#!/usr/bin/env bash

set -x

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE

# Install CocoaPods
echo "📦 Install CocoaPods"
brew install cocoapods
brew install node@18
brew link node@18

npm config set maxsockets 3
npm ci --force

npm run build
npm run ios
