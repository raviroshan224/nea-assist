import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { db, storage } from "../firebase";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Image,
} from "react-bootstrap";
import CourseManager from "./CourseManager";

const AdminDashboard = () => {
  const [universities, setUniversities] = useState([]);
  const [newUniversityName, setNewUniversityName] = useState("");
  const [newUniversityType, setNewUniversityType] = useState("university");
  const [editUniversityId, setEditUniversityId] = useState(null);
  const [editUniversityName, setEditUniversityName] = useState("");
  const [editUniversityType, setEditUniversityType] = useState("university");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [newUniversityLogo, setNewUniversityLogo] = useState(null);
  const [editUniversityLogo, setEditUniversityLogo] = useState(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    const querySnapshot = await getDocs(collection(db, "universities"));
    setUniversities(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddUniversity = async () => {
    if (!newUniversityName.trim()) return alert("University name cannot be empty");

    let logoURL = "";
    if (newUniversityLogo) {
      const logoRef = ref(storage, `university_logos/${Date.now()}_${newUniversityLogo.name}`);
      await uploadBytes(logoRef, newUniversityLogo);
      logoURL = await getDownloadURL(logoRef);
    }

    await addDoc(collection(db, "universities"), {
      name: newUniversityName,
      type: newUniversityType,
      logo: logoURL,
    });

    setNewUniversityName("");
    setNewUniversityType("university");
    setNewUniversityLogo(null);
    setShowAddModal(false);
    fetchUniversities();
  };

  const handleEditUniversity = async () => {
    if (!editUniversityName.trim()) return alert("University name cannot be empty");

    const universityRef = doc(db, "universities", editUniversityId);

    let logoURL = "";
    if (editUniversityLogo) {
      const logoRef = ref(storage, `university_logos/${Date.now()}_${editUniversityLogo.name}`);
      await uploadBytes(logoRef, editUniversityLogo);
      logoURL = await getDownloadURL(logoRef);
    }

    const updateData = {
      name: editUniversityName,
      type: editUniversityType,
      ...(logoURL && { logo: logoURL }),
    };

    await updateDoc(universityRef, updateData);

    setEditUniversityId(null);
    setEditUniversityName("");
    setEditUniversityType("university");
    setEditUniversityLogo(null);
    setShowEditModal(false);
    fetchUniversities();
  };

  const handleDeleteUniversity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this university?")) return;
    await deleteDoc(doc(db, "universities", id));
    if (selectedUniversity?.id === id) setSelectedUniversity(null);
    fetchUniversities();
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <h3 className="fw-bold">NEA Assist</h3>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          + Add University/Board
        </Button>
      </div>

      <Row>
        {universities.map((university) => (
          <Col xs={12} sm={6} md={4} key={university.id} className="mb-4">
            <Card className="border border-primary border-opacity-25 shadow-lg rounded-4 h-100">
              <Card.Body>
                <div className="text-center mb-2">
                  {university.logo && (
                    <Image
                      src={university.logo}
                      alt="Logo"
                      fluid
                      style={{ maxHeight: "80px", objectFit: "contain" }}
                    />
                  )}
                </div>
                <Card.Title className="text-center">{university.name}</Card.Title>
                <Card.Subtitle className="text-muted text-center">
                  {university.type === "board" ? "📘 Board Level" : "🎓 University Level"}
                </Card.Subtitle>
                <div className="d-flex justify-content-between mt-3 flex-wrap gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setEditUniversityId(university.id);
                      setEditUniversityName(university.name);
                      setEditUniversityType(university.type || "university");
                      setShowEditModal(true);
                    }}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteUniversity(university.id)}
                  >
                    🗑️ Delete
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => setSelectedUniversity(university)}
                  >
                    📘 View Courses
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedUniversity && (
        <div className="mt-5">
          <CourseManager university={selectedUniversity} />
        </div>
      )}

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New University/Board</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>University/Board Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={newUniversityName}
              onChange={(e) => setNewUniversityName(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={newUniversityType}
              onChange={(e) => setNewUniversityType(e.target.value)}
            >
              <option value="university">University Level</option>
              <option value="board">Board Level</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Logo (optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setNewUniversityLogo(e.target.files[0])}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddUniversity}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit University/Board</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Edit Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Edit university/board name"
              value={editUniversityName}
              onChange={(e) => setEditUniversityName(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={editUniversityType}
              onChange={(e) => setEditUniversityType(e.target.value)}
            >
              <option value="university">University Level</option>
              <option value="board">Board Level</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Change Logo (optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setEditUniversityLogo(e.target.files[0])}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditUniversity}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
