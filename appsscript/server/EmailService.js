/**
 * EmailService.js
 * Handles automated daily communication to parents.
 */

/**
 * Main entry point for the daily automation.
 * This is the function the trigger will call.
 */
function sendDailySummaryEmail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lessonsSheet = ss.getSheetByName('Lessons');
  const tasksSheet = ss.getSheetByName('LessonTask');
  if (!lessonsSheet) return;

  let tasksByLessonId = {};
  if (tasksSheet) {
    const taskData = tasksSheet.getDataRange().getDisplayValues();
    if (taskData.length > 1) {
      const tHeaders = taskData[0].map(h => h.toString().trim());
      const tLessonIdIdx = tHeaders.indexOf('LessonId');
      const tNameIdx = tHeaders.indexOf('TaskName');
      const tNotesIdx = tHeaders.indexOf('Notes');
      const tStatusIdx = tHeaders.indexOf('Status');
      
      for (let i = 1; i < taskData.length; i++) {
        const row = taskData[i];
        const lId = row[tLessonIdIdx];
        const tName = row[tNameIdx];
        const tNotes = row[tNotesIdx] || '';
        const tStatus = row[tStatusIdx] || '';
        
        if (!tasksByLessonId[lId]) tasksByLessonId[lId] = [];
        tasksByLessonId[lId].push({ name: tName, notes: tNotes, status: tStatus });
      }
    }
  }

  const lessons = lessonsSheet.getDataRange().getDisplayValues();
  if (lessons.length < 2) return;

  const headers = lessons[0].map(h => h.toString().trim());
  const idIdx = headers.indexOf('LessonId');
  const statusIdx = headers.indexOf('Status');
  const weeklyIdx = headers.indexOf('LearnInThisWeek');
  const nameIdx = headers.indexOf('LessonName');
  const learnedIdx = headers.indexOf('LearnedCount');
  const targetIdx = headers.indexOf('TargetCount');

  let inProgressCount = 0;
  let weeklyPlanCount = 0;
  const inProgressList = [];
  const weeklyList = [];

  for (let i = 1; i < lessons.length; i++) {
    const row = lessons[i];
    const lId = row[idIdx];
    const status = row[statusIdx] || '';
    const isWeekly = (row[weeklyIdx] || '').toString().toUpperCase() === 'TRUE';
    const name = row[nameIdx] || 'Unnamed Lesson';
    const learned = parseInt(row[learnedIdx]) || 0;
    const target = parseInt(row[targetIdx]) || 1;
    const tasks = tasksByLessonId[lId] || [];

    if (status === 'In Progress') {
      inProgressCount++;
      inProgressList.push({ name, learned, target, tasks });
    }
    if (isWeekly) {
      weeklyPlanCount++;
      weeklyList.push({ name, learned, target, tasks });
    }
  }

  const userEmail = Session.getEffectiveUser().getEmail();
  const wifeEmail = getAppSettings()['wife_email'] || ''; // Optional wife email from settings
  
  const recipients = [userEmail];
  if (wifeEmail) recipients.push(wifeEmail);

  // Helper to generate task HTML
  const generateTaskHtml = (tasks) => {
    if (!tasks || tasks.length === 0) return '';
    let html = '<ul style="margin: 8px 0 0 0; padding-left: 20px; color: #475569; font-size: 13px;">';
    tasks.forEach(t => {
      const statusIcon = t.status === 'Completed' ? '✅' : '⏳';
      html += `<li style="margin-bottom: 4px;"><strong>${t.name}</strong> ${t.notes ? `<em style="color: #64748b; font-size: 11px;">(${t.notes})</em>` : ''}</li>`;
    });
    html += '</ul>';
    return html;
  };

  const htmlBody = `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px; color: white; text-align: center;">
            <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; font-weight: 800; margin: 0 0 8px 0; opacity: 0.8;">Homeschool Daily Digest</p>
            <h1 style="margin: 0; font-weight: 900; font-size: 24px;">Today's Learning Goals</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>

          <div style="padding: 32px;">
            <!-- Summary Stats -->
            <div style="display: flex; gap: 16px; margin-bottom: 32px;">
              <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 16px; border-radius: 16px; flex: 1; text-align: center;">
                <p style="margin: 0; font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase;">In Progress</p>
                <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 900; color: #1e3a8a;">${inProgressCount}</p>
              </div>
              <div style="background: #fdf2f8; border: 1px solid #fce7f3; padding: 16px; border-radius: 16px; flex: 1; text-align: center;">
                <p style="margin: 0; font-size: 11px; font-weight: 800; color: #9d174d; text-transform: uppercase;">Weekly Plan</p>
                <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 900; color: #831843;">${weeklyPlanCount}</p>
              </div>
            </div>

            <!-- This Week's Plan / Progress Section -->
            <h2 style="font-size: 14px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 16px;">
              <span style="margin-right: 8px;">📚</span> This Week's Lessons & Tasks
            </h2>
            ${weeklyList.length > 0 ? weeklyList.map(l => `
              <div style="margin-bottom: 16px; padding: 16px; background: #fafafa; border-radius: 12px; border: 1px solid #f1f5f9;">
                <div style="font-size: 15px; font-weight: 700; color: #334155;">${l.name}</div>
                <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Target: ${l.learned} / ${l.target} sessions</div>
                ${generateTaskHtml(l.tasks)}
              </div>
            `).join('') : '<p style="font-size: 13px; color: #94a3b8; font-style: italic;">No lessons scheduled for this week.</p>'}

            <!-- Action Button -->
            <div style="margin-top: 40px; text-align: center;">
              <a href="${SCRIPT_URL_DUMMY()}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Open Homeschool App</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
            Yug Homeschool Management System • Automated Daily Summary
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    MailApp.sendEmail({
      to: recipients.join(','),
      subject: '📚 Homeschool Plan: ' + weeklyPlanCount + ' Lessons for this week',
      htmlBody: htmlBody
    });
    console.log(`[Email] Daily summary sent to: ${recipients.join(', ')}`);
  } catch (e) {
    console.error(`[Email] Failed to send: ${e.message}`);
  }
}

/**
 * Placeholder for the web app URL. 
 * Since Apps Script can't easily get its own Deployment URL programmatically 
 * without extra API calls, we use a generic placeholder or the user can update it.
 */
function SCRIPT_URL_DUMMY() {
  return "https://script.google.com/macros/s/AKfycbyI7Grdp2ZlyRjK86f6uAom5tL06A-n067_p_w/exec"; // Dummy base
}

/**
 * SET UP AUTOMATION
 * Run this function manually once from the Apps Script editor.
 */
function setupDailyEmailTrigger() {
  const functionName = 'sendDailySummaryEmail';
  
  // Clear any existing daily triggers
  const allTriggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < allTriggers.length; i++) {
    if (allTriggers[i].getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(allTriggers[i]);
    }
  }

  // Create new Daily trigger at 6 AM
  ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .nearMinute(0)
    .create();
    
  console.log(`[Trigger] Daily trigger successfully set for 6:00 AM.`);
  return "✅ Daily email trigger has been successfully set for 6:00 AM.";
}

/**
 * TEST FUNCTION
 * Run this to send a test email to yourself immediately.
 */
function testEmailSummary() {
  sendDailySummaryEmail();
  return "🚀 Test email sent! Check your inbox.";
}
