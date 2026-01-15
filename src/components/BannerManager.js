// For image upload, use: https://imgbb.com/
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { validateImageUrl, IMAGE_HOSTING_TIPS } from "../helpers/bannerHelper";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Image,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Form states for adding
  const [newBanner, setNewBanner] = useState({
    imageUrl: "",
    title: "",
    description: "",
    redirectUrl: "",
    isActive: true,
  });
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Form states for editing
  const [editBanner, setEditBanner] = useState(null);
  const [editImagePreviewError, setEditImagePreviewError] = useState(false);

  // Delete target
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setBanners(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = async () => {
    // Validate image URL
    const validation = validateImageUrl(newBanner.imageUrl);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Save URL directly to Firestore (no upload, no Base64)
      await addDoc(collection(db, "banners"), {
        imageUrl: newBanner.imageUrl.trim(),
        title: newBanner.title.trim(),
        description: newBanner.description.trim(),
        redirectUrl: newBanner.redirectUrl.trim(),
        isActive: newBanner.isActive,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setNewBanner({
        imageUrl: "",
        title: "",
        description: "",
        redirectUrl: "",
        isActive: true,
      });
      setImagePreviewError(false);
      setShowAddModal(false);
      setSuccess("Banner added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchBanners();
    } catch (err) {
      console.error("Error adding banner:", err);
      setError("Failed to add banner. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditBanner = async () => {
    if (!editBanner) return;

    // Validate image URL
    const validation = validateImageUrl(editBanner.imageUrl);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Update banner with new URL
      await updateDoc(doc(db, "banners", editBanner.id), {
        imageUrl: editBanner.imageUrl.trim(),
        title: editBanner.title.trim(),
        description: editBanner.description.trim(),
        redirectUrl: editBanner.redirectUrl.trim(),
        isActive: editBanner.isActive,
      });

      // Reset form
      setEditBanner(null);
      setEditImagePreviewError(false);
      setShowEditModal(false);
      setSuccess("Banner updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchBanners();
    } catch (err) {
      console.error("Error updating banner:", err);
      setError("Failed to update banner. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      setError("");

      // Just delete the Firestore document (no storage cleanup needed)
      await deleteDoc(doc(db, "banners", deleteTarget.id));

      setDeleteTarget(null);
      setShowDeleteModal(false);
      setSuccess("Banner deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchBanners();
    } catch (err) {
      console.error("Error deleting banner:", err);
      setError("Failed to delete banner. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await updateDoc(doc(db, "banners", banner.id), {
        isActive: !banner.isActive,
      });
      fetchBanners();
    } catch (err) {
      console.error("Error toggling banner status:", err);
      setError("Failed to update banner status");
    }
  };

  const openEditModal = (banner) => {
    setEditBanner({ ...banner });
    setEditImagePreviewError(false);
    setShowEditModal(true);
  };

  const openDeleteModal = (banner) => {
    setDeleteTarget(banner);
    setShowDeleteModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewBanner({
      imageUrl: "",
      title: "",
      description: "",
      redirectUrl: "",
      isActive: true,
    });
    setImagePreviewError(false);
    setError("");
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditBanner(null);
    setEditImagePreviewError(false);
    setError("");
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading banners...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">🖼️ Banner Management</h4>
          <p className="text-muted mb-0">Manage ads and notices displayed to users</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-info" size="sm" onClick={() => setShowHelpModal(true)}>
            ❓ How to add images
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add New Banner
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {banners.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h5 className="text-muted">No banners yet</h5>
            <p className="text-muted">
              Click "Add New Banner" to create your first banner
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {banners.map((banner) => (
            <Col xs={12} md={6} lg={4} key={banner.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <div style={{ position: "relative" }}>
                  <Card.Img
                    variant="top"
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                    style={{
                      height: "180px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x200?text=Image+Not+Found";
                    }}
                  />
                  <Badge
                    bg={banner.isActive ? "success" : "secondary"}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                    }}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Card.Body>
                  <Card.Title className="h6">
                    {banner.title || "Untitled Banner"}
                  </Card.Title>
                  {banner.description && (
                    <Card.Text className="text-muted small">
                      {banner.description.substring(0, 100)}
                      {banner.description.length > 100 ? "..." : ""}
                    </Card.Text>
                  )}
                  {banner.redirectUrl && (
                    <Card.Text className="small">
                      <a
                        href={banner.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        🔗 View Link
                      </a>
                    </Card.Text>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white border-top-0">
                  <div className="d-flex justify-content-between flex-wrap gap-2">
                    <Button
                      variant={banner.isActive ? "outline-secondary" : "outline-success"}
                      size="sm"
                      onClick={() => handleToggleActive(banner)}
                    >
                      {banner.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(banner)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => openDeleteModal(banner)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Banner Modal */}
      <Modal show={showAddModal} onHide={closeAddModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Image URL <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/banner-image.jpg"
                value={newBanner.imageUrl}
                onChange={(e) => {
                  setNewBanner({ ...newBanner, imageUrl: e.target.value });
                  setImagePreviewError(false);
                }}
              />
              <Form.Text className="text-muted">
                Paste a public HTTPS image URL (Google Drive, Imgur, imgBB, etc.)
              </Form.Text>
            </Form.Group>

            {/* Image Preview */}
            {newBanner.imageUrl && newBanner.imageUrl.startsWith("https://") && (
              <div className="mb-3 text-center">
                {!imagePreviewError ? (
                  <Image
                    src={newBanner.imageUrl}
                    alt="Preview"
                    fluid
                    rounded
                    style={{ maxHeight: "200px" }}
                    onError={() => setImagePreviewError(true)}
                  />
                ) : (
                  <Alert variant="warning" className="mb-0">
                    ⚠️ Unable to load image preview. The URL may be invalid or blocked by CORS.
                    The banner may still work on mobile apps.
                  </Alert>
                )}
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Title (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter banner title"
                value={newBanner.title}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter banner description"
                value={newBanner.description}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, description: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Redirect URL (Optional)</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com"
                value={newBanner.redirectUrl}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, redirectUrl: e.target.value })
                }
              />
              <Form.Text className="text-muted">
                Users will be redirected to this URL when clicking the banner
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="active-switch"
                label="Set as Active Banner"
                checked={newBanner.isActive}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, isActive: e.target.checked })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAddModal} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddBanner} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Add Banner"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Banner Modal */}
      <Modal show={showEditModal} onHide={closeEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editBanner && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Image URL <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://example.com/banner-image.jpg"
                  value={editBanner.imageUrl || ""}
                  onChange={(e) => {
                    setEditBanner({ ...editBanner, imageUrl: e.target.value });
                    setEditImagePreviewError(false);
                  }}
                />
                <Form.Text className="text-muted">
                  Paste a public HTTPS image URL
                </Form.Text>
              </Form.Group>

              {/* Image Preview */}
              {editBanner.imageUrl && editBanner.imageUrl.startsWith("https://") && (
                <div className="mb-3 text-center">
                  {!editImagePreviewError ? (
                    <Image
                      src={editBanner.imageUrl}
                      alt="Preview"
                      fluid
                      rounded
                      style={{ maxHeight: "200px" }}
                      onError={() => setEditImagePreviewError(true)}
                    />
                  ) : (
                    <Alert variant="warning" className="mb-0">
                      ⚠️ Unable to load image preview. The URL may be invalid or blocked by CORS.
                    </Alert>
                  )}
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Title (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter banner title"
                  value={editBanner.title || ""}
                  onChange={(e) =>
                    setEditBanner({ ...editBanner, title: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Enter banner description"
                  value={editBanner.description || ""}
                  onChange={(e) =>
                    setEditBanner({ ...editBanner, description: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Redirect URL (Optional)</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://example.com"
                  value={editBanner.redirectUrl || ""}
                  onChange={(e) =>
                    setEditBanner({ ...editBanner, redirectUrl: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="edit-active-switch"
                  label="Set as Active Banner"
                  checked={editBanner.isActive}
                  onChange={(e) =>
                    setEditBanner({ ...editBanner, isActive: e.target.checked })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditBanner} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this banner?</p>
          {deleteTarget && (
            <div className="text-center">
              <Image
                src={deleteTarget.imageUrl}
                alt="Banner to delete"
                fluid
                rounded
                style={{ maxHeight: "150px" }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                }}
              />
              {deleteTarget.title && (
                <p className="mt-2 fw-bold">{deleteTarget.title}</p>
              )}
            </div>
          )}
          <p className="text-danger mt-3 mb-0">
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteBanner}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete Banner"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Help Modal - How to add images */}
      <Modal show={showHelpModal} onHide={() => setShowHelpModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📖 How to Add Banner Images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <strong>We use imgBB for image hosting!</strong><br />
            Upload your banner image to imgBB, then paste the direct URL here.
          </Alert>

          <h6 className="fw-bold">📸 Steps to upload to imgBB:</h6>
          <ol>
            <li>Go to <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer">imgbb.com</a></li>
            <li>Click <strong>"Start Uploading"</strong></li>
            <li>Select your banner image</li>
            <li>Click <strong>"Upload"</strong></li>
            <li>After upload, find <strong>"Direct Link"</strong> in the dropdown</li>
            <li>Copy the Direct Link URL</li>
            <li>Paste it here in the Image URL field</li>
          </ol>

          <Alert variant="warning" className="mb-3">
            <strong>⚠️ Important:</strong> Make sure to copy the <strong>"Direct Link"</strong> (ends with .jpg, .png, etc.),
            NOT the "HTML Link" or "BBCode".
          </Alert>

          <Alert variant="success" className="mb-0">
            <strong>✅ Test your URL:</strong> Paste it directly in your browser. If the image displays, it will work!
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" href="https://imgbb.com/" target="_blank" rel="noopener noreferrer">
            Open imgBB
          </Button>
          <Button variant="primary" onClick={() => setShowHelpModal(false)}>
            Got it!
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BannerManager;
