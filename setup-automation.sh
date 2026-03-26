#!/bin/bash

# Mission Control Automation Setup Script
# Creates launchd plist and installs hourly task automation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$SCRIPT_DIR/.."
NODE_PATH="/usr/bin/node"
LOGS_DIR="$WORKSPACE_DIR/mission-control/logs"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_FILE="$PLIST_DIR/com.mission-control.automation.plist"

echo "🔧 Setting up Mission Control hourly automation..."

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

# Create launchd plist
cat > "$PLIST_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.mission-control.automation</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/node</string>
    <string>/Users/jerome/.openclaw/workspace/mission-control/scripts/automation.js</string>
  </array>
  <key>StandardOutPath</key>
  <string>/Users/jerome/.openclaw/workspace/mission-control/logs/automation-stdout.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/jerome/.openclaw/workspace/mission-control/logs/automation-stderr.log</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>0</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
EOF

echo "✅ Created launchd plist: $PLIST_FILE"

# Unload existing if present
launchctl unload "$PLIST_FILE" 2>/dev/null || true

# Load and start
launchctl load "$PLIST_FILE"
launchctl start com.mission-control.automation

echo "✅ Loaded and started automation timer"
echo ""
echo "📋 Check status:"
echo "   launchctl list | grep mission-control"
echo ""
echo "📁 View logs:"
echo "   tail -f $LOGS_DIR/task-automation.log"
echo ""
echo "⏰ Runs every hour at minute 0"