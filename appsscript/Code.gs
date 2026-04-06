/* 
 * 🚀 REST API GATEWAY FOR VUE APP
 * 
 * This file processes POST requests from the Vue app and routes them to 
 * the existing server-side functions in your other .js files.
 */

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const args = payload.args || [];
    
    // We bind to the global scope to dynamically call the target function
    if (typeof this[action] !== 'function') {
      throw new Error(`Function '${action}' is not found backend.`);
    }
    
    const result = this[action].apply(this, args);
    
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
