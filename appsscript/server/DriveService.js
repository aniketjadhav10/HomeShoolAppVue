/**
 * DriveService.js
 * Handles file uploads to a dedicated Google Drive folder.
 */

const MEDIA_FOLDER_NAME = "Yug Homeschool Media";

/**
 * Ensures the media folder exists and is shared correctly.
 */
function ensureMediaFolderExists() {
  const folders = DriveApp.getFoldersByName(MEDIA_FOLDER_NAME);
  let folder;
  
  if (folders.hasNext()) {
    folder = folders.next();
    console.log(`[Drive] Media folder exists: ${folder.getId()}`);
  } else {
    folder = DriveApp.createFolder(MEDIA_FOLDER_NAME);
    console.log(`[Drive] Created new media folder: ${folder.getId()}`);
  }
  
  // Ensure the folder is accessible by anyone who has the link
  // (so images can be viewed in the PWA)
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return folder;
}

/**
 * Uploads a Base64 encoded image to the media folder.
 * Returns the public thumbnail/view URL.
 */
function uploadFileToDrive(base64Data, fileName) {
  try {
    const folder = ensureMediaFolderExists();
    
    // Remove Base64 metadata prefix if present (e.g. "data:image/jpeg;base64,")
    const cleanBase64 = base64Data.split(',').pop();
    const contentType = base64Data.split(';')[0].split(':')[1] || 'image/jpeg';
    
    const blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), contentType, fileName);
    const file = folder.createFile(blob);
    
    // Explicitly set sharing for the new file too
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    console.log(`[Drive] File uploaded: ${file.getName()} (${file.getId()})`);
    
    // Return a direct link or a thumbnail link that works for embedding
    return {
      id: file.getId(),
      url: file.getUrl(),
      // This is a direct-view URL that works better for <img> tags
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w1000`
    };
  } catch (e) {
    console.error(`[Drive] Upload failed: ${e.message}`);
    throw new Error(`Media upload failed: ${e.message}`);
  }
}
