import React, { useState, useEffect, useRef } from "react";
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
  Row, 
  Col, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Container,
  Alert
} from "react-bootstrap";
import SubjectManager from "./SubjectManager";

const CourseManager = ({ university }) => {
  const [courses, setCourses] = useState([]);
  const [showSubjects, setShowSubjects] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [courseName, setCourseName] = useState("");
  const [editCourse, setEditCourse] = useState({ id: "", name: "" });
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });
  const [error, setError] = useState("");
  
  const subjectsRef = useRef(null);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "universities", university.id, "courses")
      );
      setCourses(querySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      })));
    } catch (err) {
      setError("Failed to load courses");
    }
  };

  useEffect(() => {
    if (university?.id) fetchCourses();
  }, [university]);

  // Add course
  const handleAddCourse = async () => {
    if (!courseName.trim()) {
      setError("Course name is required");
      return;
    }

    try {
      await addDoc(collection(db, "universities", university.id, "courses"), {
        name: courseName.trim(),
        createdAt: new Date().toISOString()
      });
      
      setCourseName("");
      setShowAddModal(false);
      setError("");
      fetchCourses();
    } catch (err) {
      setError("Failed to add course");
    }
  };

  // Update course
  const handleUpdateCourse = async () => {
    if (!editCourse.name.trim()) {
      setError("Course name is required");
      return;
    }

    try {
      await updateDoc(
        doc(db, "universities", university.id, "courses", editCourse.id),
        { name: editCourse.name.trim() }
      );
      
      setEditCourse({ id: "", name: "" });
      setShowEditModal(false);
      setError("");
      fetchCourses();
    } catch (err) {
      setError("Failed to update course");
    }
  };

  // Delete course
  const handleDeleteCourse = async () => {
    try {
      await deleteDoc(
        doc(db, "universities", university.id, "courses", deleteTarget.id)
      );
      
      if (selectedCourse?.id === deleteTarget.id) {
        setSelectedCourse(null);
        setShowSubjects(false);
      }
      
      setDeleteTarget({ id: "", name: "" });
      setShowDeleteModal(false);
      setError("");
      fetchCourses();
    } catch (err) {
      setError("Failed to delete course");
    }
  };

  // View subjects
  const handleViewSubjects = (course) => {
    setSelectedCourse(course);
    setShowSubjects(true);
    
    setTimeout(() => {
      subjectsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Back to courses
  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setShowSubjects(false);
  };

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">📚 Courses</h4>
          <small className="text-muted">{university?.name}</small>
        </div>
        {!showSubjects && (
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Course
          </Button>
        )}
      </div>

      {/* Back button when viewing subjects */}
      {showSubjects && (
        <div className="mb-3">
          <Button variant="outline-secondary" onClick={handleBackToCourses}>
            ← Back to Courses
          </Button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {/* Courses Grid */}
      {!showSubjects && (
        <Row className="g-3">
          {courses.map((course) => (
            <Col key={course.id} xs={12} md={6} lg={4}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="h6">{course.name}</Card.Title>
                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewSubjects(course)}
                      className="flex-grow-1"
                    >
                      View Subjects
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => {
                        setEditCourse({ id: course.id, name: course.name });
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setDeleteTarget({ id: course.id, name: course.name });
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
          
          {courses.length === 0 && (
            <Col xs={12}>
              <Card className="text-center py-5">
                <Card.Body>
                  <h5>No courses yet</h5>
                  <p className="text-muted">Add your first course to get started</p>
                  <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add First Course
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* Subjects Section */}
      {showSubjects && selectedCourse && (
        <div ref={subjectsRef}>
          <div className="mb-3">
            <h5>📖 {selectedCourse.name}</h5>
            <small className="text-muted">Manage subjects for this course</small>
          </div>
          <SubjectManager university={university} course={selectedCourse} />
        </div>
      )}

      {/* Add Course Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Course Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter course name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCourse()}
            />
          </Form.Group>
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
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Course Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter course name"
              value={editCourse.name}
              onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleUpdateCourse()}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpdateCourse}>
            Update Course
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?</p>
          <p className="text-muted small">
            This action cannot be undone. All subjects and chapters will also be deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCourse}>
            Delete Course
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CourseManager;