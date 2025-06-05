import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Card,
  Button,
  Modal,
  Form,
  Table,
  Badge,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";

const extractDriveId = (url) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  return match ? match[1] : null;
};

const ChapterManager = ({ course, subject }) => {
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  
  // Form states
  const [chapterName, setChapterName] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [editChapter, setEditChapter] = useState({
    id: "",
    name: "",
    driveLink: ""
  });
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });
  const [selectedPdf, setSelectedPdf] = useState({ id: "", name: "" });

  useEffect(() => {
    if (subject?.id) {
      fetchChapters();
    }
  }, [subject]);

  const fetchChapters = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `courses/${course.id}/subjects/${subject.id}/chapters`)
      );
      setChapters(querySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      })));
    } catch (err) {
      setError("Failed to load chapters");
    }
  };

  const handleAddChapter = async () => {
    if (!chapterName.trim()) {
      setError("Chapter name is required");
      return;
    }
    
    if (!driveLink.trim()) {
      setError("Google Drive link is required");
      return;
    }

    const driveId = extractDriveId(driveLink);
    if (!driveId) {
      setError("Invalid Google Drive link format");
      return;
    }

    try {
      await addDoc(
        collection(db, `courses/${course.id}/subjects/${subject.id}/chapters`),
        {
          name: chapterName.trim(),
          pdfDriveId: driveId,
          createdAt: new Date().toISOString()
        }
      );
      
      setChapterName("");
      setDriveLink("");
      setShowAddModal(false);
      setError("");
      fetchChapters();
    } catch (err) {
      setError("Failed to add chapter");
    }
  };

  const handleUpdateChapter = async () => {
    if (!editChapter.name.trim()) {
      setError("Chapter name is required");
      return;
    }
    
    if (!editChapter.driveLink.trim()) {
      setError("Google Drive link is required");
      return;
    }

    const driveId = extractDriveId(editChapter.driveLink);
    if (!driveId) {
      setError("Invalid Google Drive link format");
      return;
    }

    try {
      await updateDoc(
        doc(db, `courses/${course.id}/subjects/${subject.id}/chapters`, editChapter.id),
        {
          name: editChapter.name.trim(),
          pdfDriveId: driveId,
          updatedAt: new Date().toISOString()
        }
      );
      
      setEditChapter({ id: "", name: "", driveLink: "" });
      setShowEditModal(false);
      setError("");
      fetchChapters();
    } catch (err) {
      setError("Failed to update chapter");
    }
  };

  const handleDeleteChapter = async () => {
    try {
      await deleteDoc(
        doc(db, `courses/${course.id}/subjects/${subject.id}/chapters`, deleteTarget.id)
      );
      
      setDeleteTarget({ id: "", name: "" });
      setShowDeleteModal(false);
      setError("");
      fetchChapters();
    } catch (err) {
      setError("Failed to delete chapter");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">📖 Chapters</h4>
          <small className="text-muted">{subject?.name}</small>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          + Add Chapter
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {/* Chapters Table */}
      <Card>
        <Card.Body>
          {chapters.length === 0 ? (
            <div className="text-center py-5">
              <h5>No chapters yet</h5>
              <p className="text-muted">Add your first chapter to get started</p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Add First Chapter
              </Button>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Chapter Details</th>
                  <th>Date Added</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter, index) => (
                  <tr key={chapter.id}>
                    <td>
                      <div className="fw-bold text-primary">
                        {index + 1}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold">{chapter.name}</div>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(chapter.createdAt)}
                      </small>
                    </td>
                    <td>
                      <Badge bg={chapter.pdfDriveId ? "success" : "warning"}>
                        {chapter.pdfDriveId ? "PDF Available" : "No PDF"}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {chapter.pdfDriveId && (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => {
                              setSelectedPdf({ 
                                id: chapter.pdfDriveId, 
                                name: chapter.name 
                              });
                              setShowPdfModal(true);
                            }}
                          >
                            View PDF
                          </Button>
                        )}
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => {
                            setEditChapter({
                              id: chapter.id,
                              name: chapter.name,
                              driveLink: `https://drive.google.com/file/d/${chapter.pdfDriveId}/view`
                            });
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget({ id: chapter.id, name: chapter.name });
                            setShowDeleteModal(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Chapter Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Chapter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Chapter Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter chapter name"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Google Drive PDF Link</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
            />
            <Form.Text className="text-muted">
              Share your PDF from Google Drive and paste the link here
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddChapter}>
            Add Chapter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Chapter Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Chapter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Chapter Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter chapter name"
              value={editChapter.name}
              onChange={(e) => setEditChapter({ ...editChapter, name: e.target.value })}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Google Drive PDF Link</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              value={editChapter.driveLink}
              onChange={(e) => setEditChapter({ ...editChapter, driveLink: e.target.value })}
            />
            <Form.Text className="text-muted">
              Share your PDF from Google Drive and paste the link here
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpdateChapter}>
            Update Chapter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Chapter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?</p>
          <p className="text-muted small">
            This action cannot be undone. The chapter and its PDF link will be permanently removed.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteChapter}>
            Delete Chapter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal 
        show={showPdfModal} 
        onHide={() => setShowPdfModal(false)} 
        size="xl" 
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>📄 {selectedPdf.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          {selectedPdf.id ? (
            <iframe
              title={`PDF Viewer - ${selectedPdf.name}`}
              src={`https://drive.google.com/file/d/${selectedPdf.id}/preview`}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ minHeight: "600px" }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center text-muted">
                <div style={{ fontSize: "3rem" }} className="mb-3">📄</div>
                <h5>No PDF Selected</h5>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ChapterManager;