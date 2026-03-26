#!/usr/bin/env node

/**
 * Mission Control Web App Automation
 * Executes actual development work to build the web app version
 * 
 * Context:
 * - Building web app version of existing iOS app
 * - iOS app + backend already functional
 * - Web app uses same backend APIs
 * - Do NOT modify iOS app or backend without permission
 */

const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const WORKSPACE = path.join(__dirname, '..');
const LOG_FILE = path.join(WORKSPACE, 'logs/task-automation.log');
const STATE_FILE = path.join(WORKSPACE, 'logs/automation-state.json');

// Ensure logs directory exists
const logsDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
  console.log(logEntry.trim());
}

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (err) {
    log(`Error loading state: ${err.message}`);
  }
  return { lastRun: null, completedTasks: [], inProgressTasks: [] };
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    log(`Error saving state: ${err.message}`);
  }
}

function makeRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    log(`Fetching: ${url}`);
    
    const reqOptions = {
      hostname: new URL(url).hostname,
      port: new URL(url).port || 80,
      path: new URL(url).pathname,
      method: options.method || 'GET',
      headers: options.headers || { 'Content-Type': 'application/json' }
    };
    
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (err) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

function executeCommand(command, cwd = WORKSPACE, timeout = 300000) {
  return new Promise((resolve, reject) => {
    log(`Executing: ${command}`);
    
    const proc = exec(command, { 
      cwd, 
      timeout,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr, command });
        return;
      }
      resolve({ stdout, stderr, command });
    });
    
    proc.on('error', (err) => reject(err));
  });
}

async function executeDevelopmentTask(task) {
  log(`\n🚀 Starting development task: "${task.title}"`);
  log(`   ID: ${task.id}`);
  log(`   Type: ${task.type}`);
  log(`   Priority: ${task.priority}`);
  log(`   Due: ${task.dueDate || 'No due date'}`);
  
  // Check if task has instructions
  if (!task.details || !task.details.trim()) {
    log(`   ⚠️ No task details, skipping`);
    return { success: false, reason: 'No task details' };
  }
  
  log(`   📝 Instructions: ${task.details.substring(0, 200)}...`);
  
  // Update to in_progress
  try {
    await makeRequest(`/api/sqlite/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'in_progress' })
    });
    log(`   🔄 Status: in_progress`);
  } catch (err) {
    log(`   ❌ Failed to update status: ${err.message}`);
    return { success: false, reason: err.message };
  }
  
  // Execute the task based on type
  let success = false;
  let result = '';
  
  try {
    if (task.type === 'recurring') {
      log(`   🔄 Executing recurring task...`);
      // For recurring tasks, execute automation prompt if available
      if (task.automation_prompt) {
        const execResult = await executeCommand(task.automation_prompt);
        log(`   ✅ Recurring task executed`);
        result = execResult.stdout;
        success = true;
      } else {
        log(`   ⚠️ No automation prompt for recurring task`);
      }
    } else if (task.type === 'goal') {
      log(`   🎯 Executing goal task...`);
      // For goals, execute detailed instructions
      if (task.automation_prompt) {
        const execResult = await executeCommand(task.automation_prompt);
        log(`   ✅ Goal task executed`);
        result = execResult.stdout;
        success = true;
      } else {
        log(`   ⚠️ No automation prompt for goal task`);
      }
    } else {
      // one-off task - execute development work
      log(`   💻 Executing one-off development task...`);
      
      // Check if there's an automation prompt
      if (task.automation_prompt) {
        const execResult = await executeCommand(task.automation_prompt);
        log(`   ✅ Development task executed`);
        result = execResult.stdout;
        success = true;
      } else {
        log(`   ⚠️ No automation prompt - cannot execute automatically`);
        log(`   💡 This task needs manual completion or automation prompt added`);
      }
    }
    
  } catch (err) {
    log(`   ❌ Task execution failed: ${err.error?.message || err.message}`);
    log(`   💡 Error details: ${err.stderr || 'No error output'}`);
    success = false;
  }
  
  // Mark as done if successful
  if (success) {
    try {
      await makeRequest(`/api/sqlite/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'done' })
      });
      log(`   🏁 Task marked as DONE`);
      return { success: true, reason: 'Development work completed' };
    } catch (err) {
      log(`   ⚠️ Could not mark as done: ${err.message}`);
      return { success: false, reason: err.message };
    }
  } else {
    log(`   ⏳ Task marked as in_progress (will retry next hour)`);
    return { success: false, reason: 'Task not completed' };
  }
}

async function runAutomation() {
  log('\n========================================');
  log('=== Starting Web App Automation ===');
  log('========================================\n');
  
  try {
    const state = loadState();
    const now = Date.now();
    
    // Check if enough time has passed (1 hour)
    if (state.lastRun && (now - state.lastRun) < 3600000) {
      const minutesSince = Math.round((now - state.lastRun) / 60000);
      log(`⏰ Skipping: Last run was ${minutesSince} minutes ago (need 60)`);
      return;
    }
    
    // Fetch tasks
    log('📡 Fetching tasks from Mission Control...');
    const tasksResponse = await makeRequest('/api/sqlite/tasks');
    
    if (tasksResponse.status !== 200) {
      log(`❌ Error fetching tasks: ${JSON.stringify(tasksResponse.data)}`);
      return;
    }
    
    const tasks = tasksResponse.data;
    log(`📊 Found ${tasks.length} total tasks`);
    
    // Filter for active tasks (todo or in_progress)
    const activeTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
    log(`📋 Found ${activeTasks.length} active tasks`);
    
    if (activeTasks.length === 0) {
      log('✅ No active tasks to process');
      return;
    }
    
    // Process each task
    let processed = 0;
    let completed = 0;
    let skipped = 0;
    
    for (const task of activeTasks) {
      // Skip if already completed in this session
      if (state.completedTasks.includes(task.id)) {
        log(`⏭️ Skipping completed: ${task.title}`);
        skipped++;
        continue;
      }
      
      // Skip if currently in progress
      if (state.inProgressTasks.includes(task.id)) {
        log(`⏭️ Skipping in progress: ${task.title}`);
        skipped++;
        continue;
      }
      
      // Mark as in progress for this session
      state.inProgressTasks.push(task.id);
      saveState(state);
      
      try {
        const result = await executeDevelopmentTask(task);
        processed++;
        
        if (result.success) {
          completed++;
          state.completedTasks.push(task.id);
        }
      } finally {
        // Remove from in progress list
        state.inProgressTasks = state.inProgressTasks.filter(id => id !== task.id);
        saveState(state);
      }
    }
    
    // Update state
    state.lastRun = now;
    saveState(state);
    
    log('\n========================================');
    log('=== Automation Complete ===');
    log('========================================');
    log(`📊 Summary:`);
    log(`   Tasks processed: ${processed}`);
    log(`   Tasks completed: ${completed}`);
    log(`   Tasks skipped: ${skipped}`);
    log('========================================\n');
    
  } catch (err) {
    log(`❌ Automation failed: ${err.message}`);
    console.error(err);
  }
}

// Run if called directly
if (require.main === module) {
  runAutomation().catch(err => {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runAutomation };