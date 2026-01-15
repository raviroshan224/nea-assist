import React, { useState, useEffect, useCallback, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { Modal } from "react-bootstrap";
import "./Banner.css";

/**
 * Banner Component - Slideshow Version
 * - Mounted at App root level (outside Routes)
 * - Fetches ALL active banners from Firestore (single fetch)
 * - Shows as a modal dialog on app load
 * - Auto-slides through banners every 3 seconds
 * - Loops continuously while dialog is open
 * - Uses proper React lifecycle (no timing hacks)
 */
const Banner = () => {
  // State for all banners
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Slideshow state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Ref for interval cleanup
  const intervalRef = useRef(null);

  // Debug: Log component mount
  useEffect(() => {
    console.log("[Banner] Component mounted at app root");
    return () => {
      console.log("[Banner] Component unmounted");
      // Cleanup interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Fetch ALL active banners from Firestore (single fetch)
   * - Fetches all active banners
   * - Sorts by createdAt client-side (avoids composite index requirement)
   */
  const fetchBanners = useCallback(async () => {
    console.log("[Banner] Fetching all active banners from Firestore...");
    try {
      setLoading(true);

      // Simple query: Get all active banners (no orderBy to avoid index requirement)
      const q = query(
        collection(db, "banners"),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);
      console.log("[Banner] Query returned", querySnapshot.size, "documents");

      if (!querySnapshot.empty) {
        // Map and sort client-side by createdAt descending (latest first)
        const fetchedBanners = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(b => b.imageUrl) // Only banners with images
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
          });
        
        console.log("[Banner] Valid banners found:", fetchedBanners.length);
        setBanners(fetchedBanners);
      } else {
        console.log("[Banner] No active banners found");
        setBanners([]);
      }
    } catch (err) {
      console.error("[Banner] Error fetching banners:", err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Effect #1: Fetch banners on mount (SINGLE FETCH)
   */
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  /**
   * Effect #2: Decide whether to open dialog
   * Opens dialog only if there are valid banners
   */
  useEffect(() => {
    console.log("[Banner] Decision effect - loading:", loading, "banners:", banners.length);
    
    // Wait for loading to complete
    if (loading) {
      console.log("[Banner] Still loading, waiting...");
      return;
    }

    // Check if we have valid banners
    if (banners.length === 0) {
      console.log("[Banner] No valid banners to show");
      return;
    }

    // All conditions met - open the dialog
    console.log("[Banner] ✅ Opening dialog with", banners.length, "banners!");
    setCurrentIndex(0); // Reset to first banner
    setIsDialogOpen(true);
  }, [loading, banners]);

  /**
   * Effect #3: Auto-slide interval
   * Runs only when:
   * - Dialog is open
   * - More than 1 banner exists
   */
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't start interval if dialog closed or only 1 or 0 banners
    if (!isDialogOpen || banners.length <= 1) {
      console.log("[Banner] No slideshow needed - dialog:", isDialogOpen, "count:", banners.length);
      return;
    }

    console.log("[Banner] Starting slideshow interval (3s) for", banners.length, "banners");

    // Start interval for auto-sliding
    intervalRef.current = setInterval(() => {
      // Trigger transition animation
      setIsTransitioning(true);
      
      // After fade-out, change image
      setTimeout(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % banners.length;
          console.log("[Banner] Sliding to banner", nextIndex + 1, "of", banners.length);
          return nextIndex;
        });
        setImageLoaded(false); // Reset image loaded state for new image
        setIsTransitioning(false);
      }, 300); // 300ms for fade transition
    }, 3000); // Change every 3 seconds

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        console.log("[Banner] Clearing slideshow interval");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isDialogOpen, banners.length]);

  /**
   * Effect #4: Reset index when banners array changes
   */
  useEffect(() => {
    if (banners.length > 0 && currentIndex >= banners.length) {
      setCurrentIndex(0);
    }
  }, [banners, currentIndex]);

  // Debug: Log dialog state changes
  useEffect(() => {
    console.log("[Banner] isDialogOpen changed to:", isDialogOpen);
  }, [isDialogOpen]);

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    setIsDialogOpen(false);
    // Interval cleanup happens in Effect #3
  };

  /**
   * Handle banner click (redirect if URL exists)
   */
  const handleBannerClick = () => {
    const currentBanner = banners[currentIndex];
    if (currentBanner?.redirectUrl) {
      window.open(currentBanner.redirectUrl, "_blank", "noopener,noreferrer");
      handleClose();
    }
  };

  /**
   * Handle image load complete
   */
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  /**
   * Handle image load error
   */
  const handleImageError = () => {
    console.log("[Banner] Image failed to load for banner", currentIndex);
    // Skip to next banner if there are more
    if (banners.length > 1) {
      setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
    } else {
      // Close dialog if only banner fails
      setIsDialogOpen(false);
    }
  };

  /**
   * Manual navigation (dots)
   */
  const goToBanner = (index) => {
    if (index >= 0 && index < banners.length && index !== currentIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setImageLoaded(false);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // Get current banner
  const currentBanner = banners[currentIndex] || null;

  // ALWAYS render the Modal - control visibility with show={isDialogOpen}
  return (
    <Modal
      show={isDialogOpen && !loading && banners.length > 0}
      onHide={handleClose}
      centered
      size="lg"
      className="banner-modal"
      backdrop="static"
      keyboard={true}
      style={{ zIndex: 9999 }}
    >
      {currentBanner && (
        <>
          <Modal.Header closeButton className="banner-modal-header" />

          <Modal.Body className="banner-modal-body p-0">
            <div
              className={`banner-image-wrapper ${currentBanner.redirectUrl ? "clickable" : ""} ${isTransitioning ? "transitioning" : ""}`}
              onClick={currentBanner.redirectUrl ? handleBannerClick : undefined}
              role={currentBanner.redirectUrl ? "button" : "img"}
              tabIndex={currentBanner.redirectUrl ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentBanner.redirectUrl) {
                  handleBannerClick();
                }
              }}
            >
              {/* Loading skeleton while image loads */}
              {!imageLoaded && (
                <div className="banner-skeleton">
                  <div className="skeleton-shimmer"></div>
                </div>
              )}

              {/* Banner image with fade transition */}
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title || `Banner ${currentIndex + 1}`}
                className={`banner-modal-image ${imageLoaded ? "loaded" : "loading"} ${isTransitioning ? "fade-out" : "fade-in"}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />

              {/* Click indicator intentionally removed - only image shown */}
            </div>
            {/* Description intentionally removed - only image shown */}

            {/* Slideshow indicators (dots) - only show if multiple banners */}
            {banners.length > 1 && (
              <div className="banner-indicators">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    className={`banner-indicator-dot ${index === currentIndex ? "active" : ""}`}
                    onClick={() => goToBanner(index)}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </Modal.Body>
        </>
      )}
    </Modal>
  );
};

export default Banner;
