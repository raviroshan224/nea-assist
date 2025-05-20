import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Container, Modal, Spinner, Button } from "react-bootstrap";
import { FaFilePdf, FaDownload, FaMoon, FaSun } from "react-icons/fa";

const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);
  const toggle = () => setDarkMode((prev) => !prev);
  return [darkMode, toggle];
};

const useThemeColors = (darkMode) =>
  useMemo(
    () => ({
      primary: "#114B5F",
      secondary: "#028090",
      light: darkMode ? "#1a1a1a" : "#f8f9fa",
      text: darkMode ? "#f1f1f1" : "#111",
      shadow: "rgba(0, 0, 0, 0.08)",
      border: darkMode ? "#333" : "#e0e0e0",
      cardBg: darkMode ? "#2b2b2b" : "#fff",
    }),
    [darkMode]
  );

const ChapterPage = () => {
  const { courseId, subjectId, courseSlug, subjectSlug } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdfId, setSelectedPdfId] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const [darkMode, toggleDarkMode] = useDarkMode();
  const colors = useThemeColors(darkMode);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let courseDocId = courseId;
      let subjectDocId = subjectId;

      try {
        if (courseSlug && subjectSlug) {
          const courseSnap = await getDocs(
            query(collection(db, "courses"), where("slug", "==", courseSlug))
          );
          if (!courseSnap.empty) {
            const courseDoc = courseSnap.docs[0];
            courseDocId = courseDoc.id;
            setCourseData(courseDoc.data());

            const subjectSnap = await getDocs(
              query(
                collection(db, `courses/${courseDocId}/subjects`),
                where("slug", "==", subjectSlug)
              )
            );
            if (!subjectSnap.empty) {
              const subjectDoc = subjectSnap.docs[0];
              subjectDocId = subjectDoc.id;
              setSubjectData(subjectDoc.data());
            }
          }
        } else {
          const courseSnap = await getDoc(doc(db, "courses", courseId));
          const subjectSnap = await getDoc(
            doc(db, `courses/${courseId}/subjects`, subjectId)
          );
          if (courseSnap.exists()) setCourseData(courseSnap.data());
          if (subjectSnap.exists()) setSubjectData(subjectSnap.data());
        }

        if (courseDocId && subjectDocId) {
          const chapterSnap = await getDocs(
            collection(
              db,
              `courses/${courseDocId}/subjects/${subjectDocId}/chapters`
            )
          );
          setChapters(
            chapterSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }

      setLoading(false);
    };

    fetchData();
  }, [courseId, subjectId, courseSlug, subjectSlug]);

  const handleViewPdf = (driveId) => {
    setSelectedPdfId(driveId);
    setShowPdfModal(true);
  };

  const handleDownloadPdf = (driveId) => {
    window.open(
      `https://drive.google.com/uc?export=download&id=${driveId}`,
      "_blank"
    );
  };

  return (
    <div
      style={{
        backgroundColor: colors.light,
        minHeight: "100vh",
        paddingTop: 30,
        color: colors.text,
      }}
    >
      <Container style={{ maxWidth: 900 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              color: colors.primary,
            }}
          >
            {subjectData?.name || "Loading..."}
          </h2>
          <Button
            variant={darkMode ? "light" : "dark"}
            onClick={toggleDarkMode}
            style={{ borderRadius: "50%" }}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </Button>
        </header>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : chapters.length === 0 ? (
          <p style={{ textAlign: "center", fontSize: 18 }}>
            No chapters found for this subject.
          </p>
        ) : (
          chapters.map((chapter) => (
            <section
              key={chapter.id}
              style={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                padding: "16px 24px",
                marginBottom: 20,
                boxShadow: `0 4px 10px ${colors.shadow}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", fontWeight: 600 }}>
                <FaFilePdf style={{ marginRight: 8, color: colors.primary }} />
                {chapter.name}
              </div>
              <div style={styles.buttonGroup}>
  <Button
    variant="outline-primary"
    onClick={() => handleViewPdf(chapter.pdfDriveId)}
    style={styles.button}
  >
    View PDF
  </Button>
  <Button
    variant="outline-success"
    onClick={() => handleDownloadPdf(chapter.pdfDriveId)}
    style={styles.button}
  >
    <FaDownload style={{ marginRight: 6 }} />
    Download
  </Button>
</div>

            </section>
          ))
        )}

        <Modal
          show={showPdfModal}
          onHide={() => setShowPdfModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>View Chapter PDF</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: "80vh" }}>
            {selectedPdfId ? (
              <iframe
                src={`https://drive.google.com/file/d/${selectedPdfId}/preview`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay"
                title="PDF Preview"
              ></iframe>
            ) : (
              <p>No PDF selected</p>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

const styles = {
  button: {
    borderRadius: 20,
    fontWeight: 500,
    padding: "6px 14px",
    fontSize: 14,
    marginLeft: 6,
  },
  buttonGroup: {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap", // Optional: Makes it responsive
},

};

export default ChapterPage;
