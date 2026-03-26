# Mission Control SQLite Integration - Setup Guide

## 🎯 Overview

This guide explains how Mission Control integrates with SQLite for automatic task tracking and synchronization.

## 🏗️ Architecture

```
Mission Control Web App (Next.js)
    ↓
    API Routes: /api/tasks, /api/sync
    ↓
    SQLite Database: memory.db
    ↓
    Mission Control JSON: data/tasks.json (source of truth)
```

## 📂 Files Created

### 1. **SQLite Database**
- **Location:** `/Users/jerome/.openclaw/workspace/sqlite/memory.db`
- **Schema:** `/Users/jerome/.openclaw/workspace/sqlite/memory-schema.sql`
- **Tables:** tasks, settings, events, task_completions, sessions, decisions, etc.

### 2. **Sync Script**
- **Location:** `/Users/jerome/.openclaw/workspace/sqlite/sync-to-sqlite.js`
- **Usage:** `node sync-to-sqlite.js --sync`
- **Features:**
  - Automatically generates UUIDs for tasks without IDs
  - Syncs all web app tasks to SQLite
  - Updates sync timestamp
  - Handles JSON escaping properly

### 3. **Next.js API Routes**
- `/api/tasks` - Fetch all web app tasks
- `/api/tasks/stats` - Fetch sync status and statistics
- `/api/sync` - Trigger manual sync and update task status

### 4. **Test Page**
- **URL:** `/test` (after starting dev server)
- **Features:**
  - View real-time task statistics
  - Sync button to refresh from JSON
  - Status change dropdown (auto-saves to SQLite)
  - Last sync timestamp display

### 5. **SQLite CLI Tools**
- `/Users/jerome/.openclaw/workspace/sqlite/memory-cli.js` - Query and manage SQLite
- `/Users/jerome/.openclaw/workspace/sqlite/task-tracker.js` - Track task progress

## 🚀 How to Use

### Starting the Dev Server

```bash
cd /Users/jerome/.openclaw/workspace/mission-control
npm run dev
```

### Accessing the Test Page

Navigate to: `http://localhost:3000/test`

### Manual Sync

```bash
cd /Users/jerome/.openclaw/workspace/sqlite
node sync-to-sqlite.js --sync
```

### Querying SQLite Directly

```bash
# View all tasks
sqlite3 -header -column /Users/jerome/.openclaw/workspace/sqlite/memory.db "SELECT * FROM tasks WHERE title LIKE '%Web App%';"

# View statistics
sqlite3 -header -column /Users/jerome/.openclaw/workspace/sqlite/memory.db "SELECT * FROM task_stats;"

# View sync status
sqlite3 -header -column /Users/jerome/.openclaw/workspace/sqlite/memory.db "SELECT * FROM settings;"
```

## 🔄 Sync Workflow

### Automatic Sync (Recommended)

1. **Edit tasks.json** in Mission Control
2. **Click "Sync Now"** on test page or call `/api/sync`
3. **SQLite updates automatically** - tasks, sync timestamp, statistics

### Manual CLI Sync

```bash
# Run sync script
node sync-to-sqlite.js --sync

# View status
node sync-to-sqlite.js --status
```

## 📊 Database Schema

### Key Tables

**tasks** - Main task tracking table
- `id` - UUID
- `title` - Task title
- `status` - todo, in_progress, done
- `priority` - low, medium, high, critical
- `phase` - Phase number (1-6)
- `version` - Version string (v1.0.0, etc.)
- `due_date` - Due date
- `milestones` - Comma-separated milestones

**settings** - System settings
- `key` - Setting name
- `value` - Setting value (last_sync timestamp)

**events** - Activity log
- `event_type` - Type of event
- `summary` - Event description
- `created_at` - Timestamp

## ✅ Testing Checklist

### Before Launch

- [ ] SQLite database created and populated
- [ ] Sync script runs successfully
- [ ] API routes respond correctly
- [ ] Test page displays real data
- [ ] Status changes save to database
- [ ] Sync button updates from JSON
- [ ] Statistics display correctly

### After Launch

- [ ] Monitor error logs
- [ ] Check sync timestamp updates
- [ ] Verify data consistency between JSON and SQLite
- [ ] Test all CRUD operations

## 🔧 Troubleshooting

### Issue: Tasks not showing in SQLite

**Solution:** Run sync script manually
```bash
node sync-to-sqlite.js --sync
```

### Issue: API routes not responding

**Solution:** Check if Next.js dev server is running
```bash
cd /Users/jerome/.openclaw/workspace/mission-control
npm run dev
```

### Issue: Database connection errors

**Solution:** Verify SQLite file exists and permissions
```bash
ls -la /Users/jerome/.openclaw/workspace/sqlite/memory.db
```

## 📝 Next Steps

1. **Start dev server** and test the UI
2. **Verify sync** works automatically
3. **Monitor** for any errors
4. **Deploy** to production when ready

## 🎉 Success Criteria

✅ All 24 web app tasks synced to SQLite  
✅ Test page shows real-time statistics  
✅ Status changes save automatically  
✅ Sync button updates from JSON  
✅ No manual intervention required  

---

*Created: 2026-03-01*  
*Last Updated: 2026-03-01 07:50 GMT+1*