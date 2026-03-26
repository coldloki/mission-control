# Mission Control Hourly Task Automation

## How It Works

Every hour at minute 0, the automation:

1. **Fetches all tasks** from Mission Control SQLite database
2. **Filters active tasks** (status: `todo` or `in_progress`, excluding `done`)
3. **For each task**:
   - Checks if it has an `automation_prompt` field
   - **If YES**: Executes the shell command(s) in `automation_prompt`
   - **If successful**: Marks task as `done` ✅
   - **If fails**: Keeps task as `in_progress` for retry next hour ⏳
   - **If NO automation_prompt**: Skips task (needs manual attention)
4. **Logs all activity** to `logs/task-automation.log`

## Task Requirements

For a task to be automatically completed, it must have:

- **Status**: `todo` or `in_progress`
- **automation_prompt**: Valid shell command(s) that execute successfully

Example automation_prompt:
```bash
echo "Hello World" > /tmp/test.txt && cat /tmp/test.txt
```

Or multiple commands:
```bash
cd /some/dir && make build && npm test
```

## Setup

**Option 1: macOS launchd (recommended)**

```bash
cd /Users/jerome/.openclaw/workspace/mission-control
chmod +x setup-automation.sh
./setup-automation.sh
```

This creates a launchd timer that runs every hour at minute 0.

**Option 2: Crontab (fallback)**

```bash
echo "0 * * * * /usr/bin/node /Users/jerome/.openclaw/workspace/mission-control/scripts/automation.js >> /Users/jerome/.openclaw/workspace/mission-control/logs/cron.log 2>&1" | crontab -
```

## Logs

- **Main log**: `mission-control/logs/task-automation.log` (all automation activity)
- **stdout**: `mission-control/logs/automation-stdout.log` (launchd output)
- **stderr**: `mission-control/logs/automation-stderr.log` (launchd errors)

## Testing

**Run immediately:**
```bash
node /Users/jerome/.openclaw/workspace/mission-control/scripts/automation.js
```

**Check status:**
```bash
# launchd
launchctl list | grep mission-control

# crontab
crontab -l
```

## Customization

Edit `scripts/automation.js` to:

- **Change timeout**: Currently 2 minutes per task (`120000` ms)
- **Adjust time window**: Currently 1 hour between runs (`3600000` ms)
- **Add more logging**: Insert `log()` calls for debugging
- **Execute different logic**: Replace shell execution with API calls, scripts, etc.

## Current Behavior

- Tasks without `automation_prompt` are **skipped** (marked as needing manual attention)
- Tasks with failing automation remain **in_progress** (will retry next hour)
- Tasks with successful automation are marked **done** and logged

## Example Workflow

1. Create a task with `automation_prompt`: `"ls -la && date > /tmp/automation-test.txt"`
2. Next hour: automation runs, executes command
3. If successful: task marked `done`
4. Check logs to verify execution