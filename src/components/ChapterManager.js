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
  ListGroup,
  Spinner,
  ButtonGroup,
} from "react-bootstrap";

const extractDriveId = (url) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  return match ? match[1] : null;
};

const ChapterManager = ({ course, subject }) => {
  const [chapters, setChapters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [newChapterName, setNewChapterName] = useState("");
  const [newDriveLink, setNewDriveLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfId, setSelectedPdfId] = useState(null);

  useEffect(() => {
    if (subject?.id) fetchChapters();
  }, [subject]);

  const fetchChapters = async () => {
    const querySnapshot = await getDocs(
      collection(db, `courses/${course.id}/subjects/${subject.id}/chapters`)
    );
    setChapters(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddOrEditChapter = async () => {
    if (!newChapterName.trim() || !newDriveLink.trim()) {
      return alert("Chapter name and Google Drive link are required.");
    }
    const driveId = extractDriveId(newDriveLink);
    if (!driveId) return alert("Invalid Google Drive link.");

    setUploading(true);
    try {
      const chapterData = {
        name: newChapterName,
        pdfDriveId: driveId,
        updatedAt: new Date(),
      };

      if (editMode) {
        await updateDoc(
          doc(db, `courses/${course.id}/subjects/${subject.id}/chapters`, currentChapterId),
          chapterData
        );
      } else {
        await addDoc(
          collection(db, `courses/${course.id}/subjects/${subject.id}/chapters`),
          { ...chapterData, createdAt: new Date() }
        );
      }

      resetForm();
      fetchChapters();
    } catch (err) {
      alert("Error saving chapter: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (chapter) => {
    setEditMode(true);
    setCurrentChapterId(chapter.id);
    setNewChapterName(chapter.name);
    setNewDriveLink(`https://drive.google.com/file/d/${chapter.pdfDriveId}/view`);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await deleteDoc(doc(db, `courses/${course.id}/subjects/${subject.id}/chapters`, id));
      fetchChapters();
    } catch (err) {
      alert("Failed to delete chapter: " + err.message);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentChapterId(null);
    setNewChapterName("");
    setNewDriveLink("");
  };

  return (
    <Card className="mt-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Chapters for: {subject.name}</h5>
        <Button onClick={() => setShowModal(true)}>+ Add Chapter</Button>
      </Card.Header>

      <Card.Body>
        <ListGroup>
          {chapters.map((chapter) => (
            <ListGroup.Item key={chapter.id} className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{chapter.name}</strong>
              </div>
              <ButtonGroup>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setSelectedPdfId(chapter.pdfDriveId);
                    setShowPdfModal(true);
                  }}
                >
                  View PDF
                </Button>
                <Button variant="outline-warning" size="sm" onClick={() => handleEdit(chapter)}>
                  Edit
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(chapter.id)}>
                  Delete
                </Button>
              </ButtonGroup>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>

      {/* Add/Edit Chapter Modal */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Chapter" : "Add New Chapter"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Chapter Name</Form.Label>
            <Form.Control
              type="text"
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
              disabled={uploading}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Google Drive File Link</Form.Label>
            <Form.Control
              type="text"
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              value={newDriveLink}
              onChange={(e) => setNewDriveLink(e.target.value)}
              disabled={uploading}
            />
            <Form.Text className="text-muted">
              Paste a link like: https://drive.google.com/file/d/<b>FILE_ID</b>/view
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetForm} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddOrEditChapter} disabled={uploading}>
            {uploading ? <Spinner animation="border" size="sm" /> : editMode ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>View Chapter PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          {selectedPdfId ? (
            <iframe
              title="PDF Viewer"
              src={`https://drive.google.com/file/d/${selectedPdfId}/preview`}
              width="100%"
              height="100%"
              allow="autoplay"
              frameBorder="0"
            ></iframe>
          ) : (
            <p>No PDF Selected</p>
          )}
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default ChapterManager;