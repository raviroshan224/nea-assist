import React, { useEffect, useState, useRef } from "react";
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
  Table,
  Row,
  Col,
  Badge,
  Alert,
  Spinner,
  Container,
  Breadcrumb,
} from "react-bootstrap";
import ChapterManager from "./ChapterManager";

const ACADEMIC_YEARS = [
  { value: "year1", label: "Year 1", color: "primary" },
  { value: "year2", label: "Year 2", color: "success" },
  { value: "year3", label: "Year 3", color: "warning" },
  { value: "year4", label: "Year 4", color: "danger" },
];

const SEMESTERS = [
  { value: "semester1", label: "Semester 1", short: "Sem 1" },
  { value: "semester2", label: "Semester 2", short: "Sem 2" },
];

const SubjectManager = ({ course }) => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Navigation states
  const [showChapters, setShowChapters] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [newSubject, setNewSubject] = useState({
    name: "",
    year: "year1",
    semester: "semester1",
    code: "",
    credits: "",
    description: ""
  });
  
  const [editSubject, setEditSubject] = useState({
    id: null,
    name: "",
    year: "year1",
    semester: "semester1",
    code: "",
    credits: "",
    description: ""
  });
  
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    year: "all",
    semester: "all",
    search: ""
  });

  const chaptersRef = useRef(null);
  const subjectsRef = useRef(null);

  useEffect(() => {
    if (course?.id) {
      fetchSubjects();
    }
  }, [course]);

  useEffect(() => {
    applyFilters();
  }, [subjects, filters]);

  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const querySnapshot = await getDocs(
        collection(db, `courses/${course.id}/subjects`)
      );
      const subjectsData = querySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Sort subjects by year and semester
      subjectsData.sort((a, b) => {
        if (a.year !== b.year) {
          return a.year.localeCompare(b.year);
        }
        return a.semester.localeCompare(b.semester);
      });
      
      setSubjects(subjectsData);
    } catch (err) {
      setError("Failed to fetch subjects. Please try again.");
      console.error("Error fetching subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...subjects];
    
    // Filter by year
    if (filters.year !== "all") {
      filtered = filtered.filter(subject => subject.year === filters.year);
    }
    
    // Filter by semester
    if (filters.semester !== "all") {
      filtered = filtered.filter(subject => subject.semester === filters.semester);
    }
    
    // Filter by search term
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(subject => 
        subject.name.toLowerCase().includes(searchTerm) ||
        (subject.code && subject.code.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredSubjects(filtered);
  };

  const resetNewSubjectForm = () => {
    setNewSubject({
      name: "",
      year: "year1",
      semester: "semester1",
      code: "",
      credits: "",
      description: ""
    });
  };

  const resetEditSubjectForm = () => {
    setEditSubject({
      id: null,
      name: "",
      year: "year1",
      semester: "semester1",
      code: "",
      credits: "",
      description: ""
    });
  };

  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) {
      setError("Subject name is required");
      return;
    }

    setLoading(true);
    try {
      const subjectData = {
        name: newSubject.name.trim(),
        year: newSubject.year,
        semester: newSubject.semester,
        code: newSubject.code.trim(),
        credits: newSubject.credits ? parseInt(newSubject.credits) : null,
        description: newSubject.description.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, `courses/${course.id}/subjects`), subjectData);
      
      resetNewSubjectForm();
      setShowAddModal(false);
      setError("");
      await fetchSubjects();
    } catch (err) {
      setError("Failed to add subject. Please try again.");
      console.error("Error adding subject:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = async () => {
    if (!editSubject.name.trim()) {
      setError("Subject name is required");
      return;
    }

    setLoading(true);
    try {
      const subjectRef = doc(db, `courses/${course.id}/subjects`, editSubject.id);
      const updateData = {
        name: editSubject.name.trim(),
        year: editSubject.year,
        semester: editSubject.semester,
        code: editSubject.code.trim(),
        credits: editSubject.credits ? parseInt(editSubject.credits) : null,
        description: editSubject.description.trim(),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(subjectRef, updateData);
      
      resetEditSubjectForm();
      setShowEditModal(false);
      setError("");
      await fetchSubjects();
    } catch (err) {
      setError("Failed to update subject. Please try again.");
      console.error("Error updating subject:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectId) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, `courses/${course.id}/subjects`, deleteSubjectId));
      
      if (selectedSubject?.id === deleteSubjectId) {
        setSelectedSubject(null);
        setShowChapters(false);
      }
      
      setDeleteSubjectId(null);
      setShowDeleteModal(false);
      setError("");
      await fetchSubjects();
    } catch (err) {
      setError("Failed to delete subject. Please try again.");
      console.error("Error deleting subject:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (subject) => {
    setEditSubject({
      id: subject.id,
      name: subject.name,
      year: subject.year,
      semester: subject.semester,
      code: subject.code || "",
      credits: subject.credits || "",
      description: subject.description || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (subjectId) => {
    setDeleteSubjectId(subjectId);
    setShowDeleteModal(true);
  };

  // Navigation handlers
  const handleViewChapters = (subject) => {
    setSelectedSubject(subject);
    setShowChapters(true);
    
    setTimeout(() => {
      if (chaptersRef.current) {
        chaptersRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setShowChapters(false);
    
    setTimeout(() => {
      if (subjectsRef.current) {
        subjectsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const getYearLabel = (year) => {
    const yearObj = ACADEMIC_YEARS.find(y => y.value === year);
    return yearObj ? yearObj.label : year;
  };

  const getYearColor = (year) => {
    const yearObj = ACADEMIC_YEARS.find(y => y.value === year);
    return yearObj ? yearObj.color : "secondary";
  };

  const getSemesterLabel = (semester) => {
    const semObj = SEMESTERS.find(s => s.value === semester);
    return semObj ? semObj.short : semester;
  };

  const getSubjectStats = () => {
    const totalSubjects = subjects.length;
    const yearDistribution = ACADEMIC_YEARS.map(year => ({
      ...year,
      count: subjects.filter(s => s.year === year.value).length
    }));
    
    return { totalSubjects, yearDistribution };
  };

  const stats = getSubjectStats();

  return (
    <Container fluid className="px-0">
      {/* Breadcrumb Navigation */}
      {/* <Breadcrumb className="mb-3">
        <Breadcrumb.Item>📚 {course?.name}</Breadcrumb.Item>
        {showChapters ? (
          <>
            <Breadcrumb.Item 
              onClick={handleBackToSubjects}
              style={{ cursor: 'pointer' }}
              className="text-primary"
            >
              📖 Subjects
            </Breadcrumb.Item>
            <Breadcrumb.Item active>📄 {selectedSubject?.name}</Breadcrumb.Item>
          </>
        ) : (
          <Breadcrumb.Item active>📖 Subjects</Breadcrumb.Item>
        )}
      </Breadcrumb> */}

      {/* Subjects Section */}
      {!showChapters && (
        <div ref={subjectsRef}>
          {/* Header Section */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <Row className="align-items-center">
                <Col>
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      <h4 className="mb-1 fw-bold text-dark">
                        📚 {course?.name || "Unnamed Course"}
                      </h4>
                      <p className="mb-0 text-muted">
                        Managing subjects 
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      {stats.yearDistribution.map(year => (
                        <Badge 
                          key={year.value} 
                          bg={year.color}
                          className="px-2 py-1"
                        >
                          {year.label}: {year.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAddModal(true)}
                    className="d-flex align-items-center gap-2"
                  >
                    <span>➕</span>
                    Add Subject
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            {/* Filters Section */}
            <Card.Body className="py-3 bg-light border-bottom">
              <Row className="align-items-center g-3">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="🔍 Search subjects by name or code..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="border-0 shadow-sm"
                  />
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                    className="border-0 shadow-sm"
                  >
                    <option value="all">All Years</option>
                    {ACADEMIC_YEARS.map(year => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filters.semester}
                    onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                    className="border-0 shadow-sm"
                  >
                    <option value="all">All Semesters</option>
                    {SEMESTERS.map(semester => (
                      <option key={semester.value} value={semester.value}>
                        {semester.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <div className="text-muted small">
                    {filteredSubjects.length} of {subjects.length} subjects
                  </div>
                </Col>
              </Row>
            </Card.Body>

            {/* Content Section */}
            <Card.Body className="p-0">
              {error && (
                <Alert variant="danger" className="m-3 mb-0">
                  {error}
                </Alert>
              )}

              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <div className="mt-2 text-muted">Loading subjects...</div>
                </div>
              )}

              {!loading && filteredSubjects.length === 0 && (
                <div className="text-center py-5">
                  <div className="text-muted mb-3">
                    <h5>📋 No subjects found</h5>
                    <p>
                      {subjects.length === 0 
                        ? "Start by adding your first subject to this course."
                        : "Try adjusting your search criteria or filters."
                      }
                    </p>
                  </div>
                  {subjects.length === 0 && (
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setShowAddModal(true)}
                    >
                      Add First Subject
                    </Button>
                  )}
                </div>
              )}

              {!loading && filteredSubjects.length > 0 && (
                <Table hover responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 py-3 fw-semibold text-dark">Subject Details</th>
                      <th className="border-0 py-3 fw-semibold text-dark">Academic Period</th>
                      <th className="border-0 py-3 fw-semibold text-dark">Credits</th>
                      <th className="border-0 py-3 fw-semibold text-dark text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.map((subject) => (
                      <tr key={subject.id}>
                        <td className="py-3">
                          <div>
                            <div className="fw-semibold text-dark">
                              {subject.name}
                            </div>
                            {subject.code && (
                              <div className="text-muted small">
                                Code: {subject.code}
                              </div>
                            )}
                            {subject.description && (
                              <div className="text-muted small mt-1">
                                {subject.description.substring(0, 100)}
                                {subject.description.length > 100 && "..."}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex gap-2">
                            <Badge bg={getYearColor(subject.year)} className="px-2 py-1">
                              {getYearLabel(subject.year)}
                            </Badge>
                            <Badge bg="secondary" className="px-2 py-1">
                              {getSemesterLabel(subject.semester)}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3">
                          {subject.credits ? (
                            <span className="fw-semibold">{subject.credits}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="py-3 text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleViewChapters(subject)}
                            >
                              📄 Chapters
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => openEditModal(subject)}
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(subject.id)}
                            >
                              🗑️
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
        </div>
      )}

      {/* Chapters Section */}
      {showChapters  && selectedSubject && (
        <div ref={chaptersRef} className="fade-in">
          <div className="d-flex align-items-center gap-3 mb-4">
            
            <div>
              <h4 className="mb-0 fw-bold">📄 {selectedSubject.name}</h4>
              <small className="text-muted">Managing chapters and content</small>
            </div>
            
          </div>
          <Button 
              variant="outline-secondary" 
              onClick={handleBackToSubjects}
              
            >
              ← Back to Subjects
            </Button>
          <ChapterManager course={course} subject={selectedSubject} />
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add New Subject</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Subject Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Introduction to Computer Science"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                  className="border-1"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Subject Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., CS101"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
                  className="border-1"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Academic Year</Form.Label>
                <Form.Select
                  value={newSubject.year}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, year: e.target.value }))}
                  className="border-1"
                >
                  {ACADEMIC_YEARS.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Semester</Form.Label>
                <Form.Select
                  value={newSubject.semester}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, semester: e.target.value }))}
                  className="border-1"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem.value} value={sem.value}>
                      {sem.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Credits</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="3"
                  min="1"
                  max="10"
                  value={newSubject.credits}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, credits: e.target.value }))}
                  className="border-1"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Brief description of the subject..."
              value={newSubject.description}
              onChange={(e) => setNewSubject(prev => ({ ...prev, description: e.target.value }))}
              className="border-1"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSubject} disabled={loading}>
            {loading ? "Adding..." : "Add Subject"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Edit Subject</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Subject Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Subject name"
                  value={editSubject.name}
                  onChange={(e) => setEditSubject(prev => ({ ...prev, name: e.target.value }))}
                  className="border-1"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Subject Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Subject code"
                  value={editSubject.code}
                  onChange={(e) => setEditSubject(prev => ({ ...prev, code: e.target.value }))}
                  className="border-1"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Academic Year</Form.Label>
                <Form.Select
                  value={editSubject.year}
                  onChange={(e) => setEditSubject(prev => ({ ...prev, year: e.target.value }))}
                  className="border-1"
                >
                  {ACADEMIC_YEARS.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Semester</Form.Label>
                <Form.Select
                  value={editSubject.semester}
                  onChange={(e) => setEditSubject(prev => ({ ...prev, semester: e.target.value }))}
                  className="border-1"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem.value} value={sem.value}>
                      {sem.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Credits</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Credits"
                  min="1"
                  max="10"
                  value={editSubject.credits}
                  onChange={(e) => setEditSubject(prev => ({ ...prev, credits: e.target.value }))}
                  className="border-1"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Brief description of the subject..."
              value={editSubject.description}
              onChange={(e) => setEditSubject(prev => ({ ...prev, description: e.target.value }))}
              className="border-1"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubject} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <div className="text-center">
            <div className="text-danger mb-3" style={{ fontSize: "3rem" }}>
              ⚠️
            </div>
            <h5 className="mb-3">Are you sure you want to delete this subject?</h5>
            <p className="text-muted">
              This action cannot be undone. All chapters and content associated with this subject will also be deleted.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 justify-content-center">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteSubject} disabled={loading}>
            {loading ? "Deleting..." : "Delete Subject"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom Styles */}
      <style>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .breadcrumb-item:not(.active):hover {
          text-decoration: underline;
        }
        
        .table tbody tr:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </Container>
  );
};

export default SubjectManager;