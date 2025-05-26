import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import CourseManager from "./CourseManager";

const AdminDashboard = () => {
  const [universities, setUniversities] = useState([]);
  const [newUniversityName, setNewUniversityName] = useState("");
  const [editUniversityId, setEditUniversityId] = useState(null);
  const [editUniversityName, setEditUniversityName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    const querySnapshot = await getDocs(collection(db, "universities"));
    setUniversities(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddUniversity = async () => {
    if (!newUniversityName.trim()) return alert("University name cannot be empty");
    await addDoc(collection(db, "universities"), { name: newUniversityName });
    setNewUniversityName("");
    setShowAddModal(false);
    fetchUniversities();
  };

  const handleEditUniversity = async () => {
    if (!editUniversityName.trim()) return alert("University name cannot be empty");
    const universityRef = doc(db, "universities", editUniversityId);
    await updateDoc(universityRef, { name: editUniversityName });
    setEditUniversityId(null);
    setEditUniversityName("");
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
          + Add University
        </Button>
      </div>

      <Row>
        {universities.map((university) => (
          <Col xs={12} sm={6} md={4} key={university.id} className="mb-4">
            <Card className="border border-primary border-opacity-25 shadow-lg rounded-4 h-100 hover-shadow transition">
              <Card.Body>
                <Card.Title>{university.name}</Card.Title>
                <div className="d-flex justify-content-between mt-3 flex-wrap gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setEditUniversityId(university.id);
                      setEditUniversityName(university.name);
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
          {/* <h4 className="fw-bold">Courses under: {selectedUniversity.name}</h4> */}
          <CourseManager university={selectedUniversity} />
        </div>
      )}

      {/* Add University Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New University</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter university name"
            value={newUniversityName}
            onChange={(e) => setNewUniversityName(e.target.value)}
          />
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

      {/* Edit University Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit University</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Edit university name"
            value={editUniversityName}
            onChange={(e) => setEditUniversityName(e.target.value)}
          />
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
