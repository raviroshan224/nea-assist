/**
 * Banner Storage Helper
 * Uses Base64 encoding to store images directly in Firestore
 * This completely bypasses Firebase Storage and avoids all CORS issues
 * 
 * TRADE-OFF: Images are stored as Base64 strings in Firestore
 * - Max recommended image size: 500KB (Firestore doc limit is 1MB)
 * - Images are embedded in the document, no separate storage needed
 * - No CORS issues since we never make XHR requests to Storage
 */

// Allowed image types
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 500 * 1024; // 500KB for Base64 (Firestore limit is 1MB per doc)

/**
 * Validate image file before processing
 * @param {File} file - The file to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Please use PNG, JPEG, GIF, or WebP" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Image size must be less than 500KB for banner images" };
  }

  return { valid: true };
};

/**
 * Convert file to Base64 data URL
 * This creates a string that can be used directly in <img src="...">
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} - Base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Process and validate banner image, return Base64 data URL
 * @param {File} file - The image file to process
 * @returns {Promise<string>} - Base64 data URL ready for Firestore storage
 */
export const processBannerImage = async (file) => {
  // Validate first
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Convert to Base64 data URL
  const base64 = await fileToBase64(file);
  return base64;
};

/**
 * Check if a URL is a Base64 data URL
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export const isBase64DataUrl = (url) => {
  return url && url.startsWith("data:");
};
