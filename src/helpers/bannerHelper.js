/**
 * Banner URL Validation Helper
 * Validates public image URLs for banner storage in Firestore
 * 
 * IMPORTANT: This app uses URL-only approach for banners
 * - NO Firebase Storage uploads
 * - NO Base64 encoding
 * - Only HTTPS public image URLs are allowed
 */

/**
 * Validate banner image URL
 * @param {string} url - The URL to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImageUrl = (url) => {
  if (!url || !url.trim()) {
    return { valid: false, error: "Image URL is required" };
  }

  const trimmedUrl = url.trim();

  // Must be HTTPS
  if (!trimmedUrl.startsWith("https://")) {
    return { valid: false, error: "URL must start with https://" };
  }

  // Reject Base64 data URLs (explicitly forbidden)
  if (trimmedUrl.startsWith("data:")) {
    return { valid: false, error: "Base64 data URLs are not allowed. Please use a public image URL." };
  }

  // Basic URL format check
  try {
    new URL(trimmedUrl);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  return { valid: true };
};

/**
 * Check if a URL is a Base64 data URL (for rejection)
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export const isBase64DataUrl = (url) => {
  return url && url.startsWith("data:");
};

/**
 * Instructions for admin on how to get direct image URLs
 */
export const IMAGE_HOSTING_TIPS = `
How to get a direct image URL:

1. Google Drive:
   - Upload image → Share → "Anyone with link"
   - Change URL: drive.google.com/file/d/ID/view
   - To: drive.google.com/uc?export=view&id=ID

2. Imgur:
   - Upload → Right-click image → "Copy image address"

3. imgBB / Postimages:
   - Upload → Copy "Direct Link"

Test: Paste URL in browser - if image shows, it will work!
`;
