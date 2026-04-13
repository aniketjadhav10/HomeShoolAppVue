const GLOBAL_ROOT = this;

function doPost(e) {
  const startTime = new Date().getTime();
  try {
    const content = e.postData.contents;
    console.log(`[Router] Received POST. Size: ${content.length} bytes`);
    const payload = JSON.parse(content);
    const action = (payload.action || "").trim();
    const args = payload.args || [];
    
    // EXHAUSTIVE LOOKUP: GAS V8 can be inconsistent with global scope across multiple files.
    // We try every possible way to find the function.
    let func = null;
    try {
      if (typeof GLOBAL_ROOT[action] === 'function') func = GLOBAL_ROOT[action];
      else if (typeof globalThis[action] === 'function') func = globalThis[action];
      else if (typeof this[action] === 'function') func = this[action];
      else {
        // Final fallback: use eval to resolve the name directly from the global namespace
        const resolved = eval(action);
        if (typeof resolved === 'function') func = resolved;
      }
    } catch (e) {
      // eval might throw if identifier doesn't exist
    }

    if (!func) {
      const allMethods = Object.keys(GLOBAL_ROOT).filter(k => typeof GLOBAL_ROOT[k] === 'function');
      console.error(`Missing function: ${action}. Found: ${allMethods.length} methods. Check for script deployment version.`);
      throw new Error(`Function '${action}' is not found backend. CRITICAL: Check if you redeployed the Web App as a NEW VERSION and updated your SCRIPT_URL in src/api.js.`);
    }
    
    const result = func.apply(null, args);
    const duration = new Date().getTime() - startTime;
    console.log(`[Router] Action '${action}' completed in ${duration}ms`);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      data: result 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
