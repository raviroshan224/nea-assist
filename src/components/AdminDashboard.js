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
  Table,
} from "react-bootstrap";
import SubjectManager from "./SubjectManager";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const [newCourseName, setNewCourseName] = useState("");
  const [editCourseId, setEditCourseId] = useState(null);
  const [editCourseName, setEditCourseName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

  const fetchCourses = async () => {
    const querySnapshot = await getDocs(collection(db, "courses"));
    setCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const userList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "N/A",
        email: data.email || "N/A",
        phone: data.phone || "N/A",
        createdAt: data.createdAt?.toDate() || new Date(0),
      };
    });
    setUsers(userList);
  };

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) return alert("Course name cannot be empty");
    await addDoc(collection(db, "courses"), { name: newCourseName });
    setNewCourseName("");
    setShowAddModal(false);
    fetchCourses();
  };

  const handleEditCourse = async () => {
    if (!editCourseName.trim()) return alert("Course name cannot be empty");
    const courseRef = doc(db, "courses", editCourseId);
    await updateDoc(courseRef, { name: editCourseName });
    setEditCourseId(null);
    setEditCourseName("");
    setShowEditModal(false);
    fetchCourses();
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    await deleteDoc(doc(db, "courses", id));
    if (selectedCourse?.id === id) setSelectedCourse(null);
    fetchCourses();
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">📘 Course Management</h3>
        <div>
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="me-2">
            + Add Course
          </Button>
          <Button variant="dark" onClick={() => setShowUserModal(true)}>
            👥 View Users
          </Button>
        </div>
      </div>

      <Row>
        {courses.map((course) => (
          <Col md={4} key={course.id} className="mb-4">
<Card className="border border-primary border-opacity-25 shadow-lg rounded-4 h-100 course-card hover-shadow transition">
              <Card.Body>
                <Card.Title>{course.name}</Card.Title>
                <div className="d-flex justify-content-between mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setEditCourseId(course.id);
                      setEditCourseName(course.name);
                      setShowEditModal(true);
                    }}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    🗑️ Delete
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => setSelectedCourse(course)}
                  >
                    📚 Subjects
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedCourse && (
        <div className="mt-5">
          <h4 className="fw-bold">Subjects for: {selectedCourse.name}</h4>
          <SubjectManager course={selectedCourse} />
        </div>
      )}

      {/* Add Course Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter course name"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCourse}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Course Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Edit course name"
            value={editCourseName}
            onChange={(e) => setEditCourseName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditCourse}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Users Modal */}
      <Modal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Registered Users ({users.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">
                    No users registered.
                  </td>
                </tr>
              )}
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
