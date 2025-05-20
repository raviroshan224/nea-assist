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
  Card,
  Button,
  Modal,
  Form,
  ListGroup,
  Row,
  Col,
} from "react-bootstrap";
import ChapterManager from "./ChapterManager";

const years = ["year1", "year2", "year3", "year4"];
const semesters = ["semester1", "semester2"];

const SubjectManager = ({ course }) => {
  const [subjects, setSubjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectYear, setNewSubjectYear] = useState("year1");
  const [newSubjectSemester, setNewSubjectSemester] = useState("semester1");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editSubjectId, setEditSubjectId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState("");

  useEffect(() => {
    if (course?.id) {
      fetchSubjects();
    }
  }, [course]);

  const fetchSubjects = async () => {
    const querySnapshot = await getDocs(
      collection(db, `courses/${course.id}/subjects`)
    );
    setSubjects(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return alert("Subject name cannot be empty");
    await addDoc(collection(db, `courses/${course.id}/subjects`), {
      name: newSubjectName,
      year: newSubjectYear,
      semester: newSubjectSemester,
    });
    setNewSubjectName("");
    setNewSubjectYear("year1");
    setNewSubjectSemester("semester1");
    setShowAddModal(false);
    fetchSubjects();
  };

  const handleEditSubject = async () => {
    if (!editSubjectName.trim()) return alert("Subject name cannot be empty");
    const subjectRef = doc(db, `courses/${course.id}/subjects`, editSubjectId);
    await updateDoc(subjectRef, { name: editSubjectName });
    setEditSubjectId(null);
    setEditSubjectName("");
    fetchSubjects();
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    await deleteDoc(doc(db, `courses/${course.id}/subjects`, subjectId));
    if (selectedSubject?.id === subjectId) {
      setSelectedSubject(null);
    }
    fetchSubjects();
  };

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Subjects for: {course?.name || "Unnamed Course"}</h4>
        <Button onClick={() => setShowAddModal(true)}>+ Add Subject</Button>
      </Card.Header>

      <Card.Body>
        <ListGroup>
          {subjects.map((subject) => (
            <ListGroup.Item key={subject.id}>
              <Row className="align-items-center">
                <Col
                  onClick={() => setSelectedSubject(subject)}
                  style={{ cursor: "pointer" }}
                >
                  {subject.name} ({subject.year}, {subject.semester})
                </Col>
                <Col xs="auto">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setEditSubjectId(subject.id);
                      setEditSubjectName(subject.name);
                    }}
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    Delete
                  </Button>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>

        {selectedSubject && (
          <div className="mt-4">
            <ChapterManager course={course} subject={selectedSubject} />
          </div>
        )}
      </Card.Body>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Subject</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Subject Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter subject name"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Select Year</Form.Label>
            <Form.Select
              value={newSubjectYear}
              onChange={(e) => setNewSubjectYear(e.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year.replace("year", "Year ")}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Select Semester</Form.Label>
            <Form.Select
              value={newSubjectSemester}
              onChange={(e) => setNewSubjectSemester(e.target.value)}
            >
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem.replace("semester", "Semester ")}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddSubject}>
            Add Subject
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={!!editSubjectId} onHide={() => setEditSubjectId(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Subject</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="New subject name"
            value={editSubjectName}
            onChange={(e) => setEditSubjectName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditSubjectId(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubject}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default SubjectManager;
