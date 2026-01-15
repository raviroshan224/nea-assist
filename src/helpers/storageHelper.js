/**
 * Firebase Storage Helper
 * Clean, minimal upload functions using Firebase v9+ modular SDK only
 * NO fetch, NO XMLHttpRequest, NO REST API, NO compat imports
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

// Allowed image types
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Validate image file before upload
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
    return { valid: false, error: "File size must be less than 2MB" };
  }

  return { valid: true };
};

/**
 * Upload image to Firebase Storage and return download URL
 * Uses ONLY uploadBytes + getDownloadURL (no resumable upload, no progress)
 * @param {File} file - The image file to upload
 * @param {string} folder - The storage folder (e.g., "banners")
 * @returns {Promise<string>} - The download URL
 */
export const uploadImage = async (file, folder = "banners") => {
  // Validate first
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create safe filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${folder}/${timestamp}_${safeName}`;

  // Get storage reference
  const storageRef = ref(storage, filePath);

  // Upload using simple uploadBytes (NOT uploadBytesResumable)
  await uploadBytes(storageRef, file);

  // Get and return download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - The download URL of the image to delete
 */
export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Extract path from download URL
    const urlPath = decodeURIComponent(imageUrl.split("/o/")[1]?.split("?")[0]);
    if (urlPath) {
      const imageRef = ref(storage, urlPath);
      await deleteObject(imageRef);
    }
  } catch (err) {
    // Log but don't throw - image might already be deleted
    console.warn("Could not delete image from storage:", err.message);
  }
};
