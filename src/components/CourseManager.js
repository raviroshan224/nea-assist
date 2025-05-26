import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import SubjectManager from "./SubjectManager";

const CourseManager = ({ university }) => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [editCourse, setEditCourse] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = async () => {
    const querySnapshot = await getDocs(
      collection(db, "universities", university.id, "courses")
    );
    setCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddCourse = async () => {
    if (!newCourse.trim()) return alert("Enter course name");
    await addDoc(collection(db, "universities", university.id, "courses"), {
      name: newCourse,
    });
    setNewCourse("");
    setShowAddModal(false);
    fetchCourses();
  };

  const handleUpdateCourse = async () => {
    if (!editCourse?.name.trim()) return alert("Enter course name");
    await updateDoc(
      doc(db, "universities", university.id, "courses", editCourse.id),
      { name: editCourse.name }
    );
    setShowEditModal(false);
    setEditCourse(null);
    fetchCourses();
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    await deleteDoc(doc(db, "universities", university.id, "courses", id));
    fetchCourses();
  };

  useEffect(() => {
    fetchCourses();
  }, [university]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <h4 className="mb-0 fw-bold">Courses under {university.name}</h4>
        <div></div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          + Add Course
        </Button>
      </div>

      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {courses.map((course) => (
          <Col key={course.id}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="mb-3">{course.name}</Card.Title>
                <div className="d-flex flex-wrap gap-2 justify-content-between">
                  
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => {
                      setEditCourse(course);
                      setShowEditModal(true);
                    }}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    🗑️ Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
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
        <>
          {/* <h5 className="mt-4">📘 Subjects under {selectedCourse.name}</h5> */}
          <SubjectManager university={university} course={selectedCourse} />
        </>
      )}

      {/* Add Course Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter course name"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCourse}>
            Add Course
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Course name"
            value={editCourse?.name || ""}
            onChange={(e) =>
              setEditCourse({ ...editCourse, name: e.target.value })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpdateCourse}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CourseManager;
