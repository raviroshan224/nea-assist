import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignInAlt, faDownload } from "@fortawesome/free-solid-svg-icons";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import logo from "../assets/nea-logo.png"; // adjust path based on where NavbarComponent is


const NavbarComponent = () => {
  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [courseIdInPath, setCourseIdInPath] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);

    setCourseName("");
    setSubjectName("");
    setCourseIdInPath("");

    if (pathParts[0] === "subjects" && pathParts[1]) {
      const courseId = pathParts[1];
      setCourseIdInPath(courseId);
      getDoc(doc(db, "courses", courseId))
        .then((docSnap) => {
          setCourseName(docSnap.exists() ? docSnap.data().name || courseId : courseId);
        })
        .catch(() => setCourseName(courseId));
    }

    if (pathParts[0] === "chapters" && pathParts[1] && pathParts[2]) {
      const courseId = pathParts[1];
      const subjectId = pathParts[2];
      setCourseIdInPath(courseId);

      getDoc(doc(db, "courses", courseId))
        .then((docSnap) => {
          setCourseName(docSnap.exists() ? docSnap.data().name || courseId : courseId);
        })
        .catch(() => setCourseName(courseId));

      getDoc(doc(db, `courses/${courseId}/subjects`, subjectId))
        .then((docSnap) => {
          setSubjectName(docSnap.exists() ? docSnap.data().name || subjectId : subjectId);
        })
        .catch(() => setSubjectName(subjectId));
    }
  }, [location.pathname]);

  // Breadcrumb component
  const Breadcrumb = () => (
    <nav aria-label="breadcrumb" className="breadcrumb-container">
      <span onClick={() => navigate("/")} className="breadcrumb-item">
        Home
      </span>
      {courseName && (
        <>
          <span className="breadcrumb-separator">/</span>
          <span
            onClick={() => navigate(`/subjects/${courseIdInPath}`)}
            className="breadcrumb-item"
          >
            {courseName}
          </span>
        </>
      )}
      {subjectName && (
        <>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">{subjectName}</span>
        </>
      )}
    </nav>
  );

  return (
    <>
      {/* Custom CSS */}
      <style>{`
        .breadcrumb-container {
          font-size: 1rem; /* slightly bigger for better match */
          color: #6c757d;
          display: flex;
          gap: 10px;
          font-weight: 600;
          user-select: none;
          white-space: nowrap;
        }

        .breadcrumb-item {
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .breadcrumb-item:hover {
          color: #0d6efd;
          text-decoration: underline;
        }

        .breadcrumb-separator {
          user-select: none;
          color: #ced4da;
          margin-left: 5px;
          margin-right: 5px;
        }

        .btn-outline-primary, 
        .btn-outline-success {
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.08em;
          border-radius: 20px;
          padding: 7px 20px;
          font-size: 0.9rem;
          transition: all 0.25s ease;
          box-shadow: none !important;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dropdown-toggle.btn-outline-primary {
          padding-left: 16px;
          padding-right: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 20px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #0d6efd;
          border: 2px solid #0d6efd;
          background: transparent;
          transition: all 0.25s ease;
          white-space: nowrap;
        }
        .dropdown-toggle.btn-outline-primary:hover, 
        .dropdown-toggle.btn-outline-primary:focus {
          color: #fff;
          background: #0d6efd;
          box-shadow: 0 3px 10px rgb(13 110 253 / 0.3);
          border-color: #0d6efd;
        }

        /* Navbar shadows and height */
        .navbar {
          height: 68px;
          box-shadow: 0 3px 15px rgb(0 0 0 / 0.1);
        }

        /* Brand and breadcrumb container for horizontal layout */
        .brand-breadcrumb-wrapper {
          display: flex;
          align-items: center;
          gap: 24px; /* increased gap for more breathing room */
          flex-wrap: nowrap;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
        }

        .navbar-logo {
          height: 64px;
          width: auto;
          
          user-select: none;
          transition: transform 0.3s ease;
        }

        .navbar-logo:hover {
          transform: scale(1.05);
        }
      `}</style>

      <Navbar expand="lg" bg="light" variant="light" className="shadow-sm sticky-top">
        <Container>
          <div className="brand-breadcrumb-wrapper">
            <Navbar.Brand className="navbar-brand" onClick={() => navigate("/")} style={{ fontWeight: "700", fontSize: "1.3rem", color: "#0d6efd" }}>
              <img 
  src={logo}
  alt="NEA Logo"
  className="navbar-logo"
  loading="lazy"
/>

            </Navbar.Brand>
            <Breadcrumb />
          </div>

          <Nav className="ms-auto d-flex align-items-center gap-3">
            <Button
              variant="outline-success"
              onClick={() => window.open("/download", "_blank")}
              aria-label="Download App"
            >
              <FontAwesomeIcon icon={faDownload} />
              Download App
            </Button>

            {!user ? (
              <Button
                variant="outline-primary"
                onClick={() => navigate("/login")}
                aria-label="Login"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                Login
              </Button>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-primary" id="dropdown-user">
                  <FontAwesomeIcon icon={faUser} />
                  {user.displayName || "User"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item disabled>Email: {user.email}</Dropdown.Item>
                  <Dropdown.Divider />
                  {/* <Dropdown.Item onClick={() => navigate("/profile")}>Profile</Dropdown.Item> */}
                  <Dropdown.Item
                    onClick={async () => {
                      await signOut(auth);
                      navigate("/");
                    }}
                  >
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default NavbarComponent;
