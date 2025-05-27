import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignInAlt, faDownload } from "@fortawesome/free-solid-svg-icons";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import logo from "../assets/nea-logo.png";

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
      getDoc(doc(db, "courses", courseId)).then((docSnap) => {
        setCourseName(docSnap.exists() ? docSnap.data().name || courseId : courseId);
      });
    }

    if (pathParts[0] === "chapters" && pathParts[1] && pathParts[2]) {
      const courseId = pathParts[1];
      const subjectId = pathParts[2];
      setCourseIdInPath(courseId);

      getDoc(doc(db, "courses", courseId)).then((docSnap) => {
        setCourseName(docSnap.exists() ? docSnap.data().name || courseId : courseId);
      });

      getDoc(doc(db, `courses/${courseId}/subjects`, subjectId)).then((docSnap) => {
        setSubjectName(docSnap.exists() ? docSnap.data().name || subjectId : subjectId);
      });
    }
  }, [location.pathname]);

  const Breadcrumb = () => (
    <nav className="breadcrumb-nav">
      <span onClick={() => navigate("/")} className="breadcrumb-link">Home</span>
      {courseName && (
        <>
          <span className="breadcrumb-separator">/</span>
          <span
            onClick={() => navigate(`/subjects/${courseIdInPath}`)}
            className="breadcrumb-link"
          >
            {courseName}
          </span>
        </>
      )}
      {subjectName && (
        <>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">{subjectName}</span>
        </>
      )}
    </nav>
  );

  return (
    <>
      <style>{`
        .breadcrumb-nav {
          font-size: 0.95rem;
          color: #6c757d;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }
        .breadcrumb-link {
          cursor: pointer;
          transition: color 0.2s;
        }
        .breadcrumb-link:hover {
          color: #0d6efd;
        }
        .breadcrumb-separator {
          color: #adb5bd;
        }

        .navbar-brand-custom {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.3rem;
          font-weight: 600;
          color: #0d6efd;
          cursor: pointer;
          white-space: nowrap;
        }

        .navbar-logo {
          height: 48px;
          width: auto;
        }

        .custom-btn {
          font-weight: 600;
          text-transform: uppercase;
          padding: 6px 16px;
          font-size: 0.85rem;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 767px) {
          .breadcrumb-nav {
            font-size: 0.85rem;
            gap: 4px;
            justify-content: center;
          }
          .navbar-brand-custom {
            font-size: 1.1rem;
          }
          .navbar-logo {
            height: 40px;
          }
          .custom-btn {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
        }
      `}</style>

      <Navbar expand="lg" bg="white" variant="light" sticky="top" className="shadow-sm">
        <Container fluid="lg">
          <Navbar.Brand onClick={() => navigate("/")} className="navbar-brand-custom">
            <img src={logo} alt="Logo" className="navbar-logo" />
            NEA
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" />

          <Navbar.Collapse id="main-navbar">
            <div className="ms-lg-4 me-auto mt-3 mt-lg-0">
              <Breadcrumb />
            </div>

            <Nav className="ms-auto d-flex align-items-center gap-2 mt-3 mt-lg-0">
              <a
  href="/assets/nea-assist.apk"
  download
  style={{ textDecoration: "none" }}
>
  <Button variant="outline-success" className="custom-btn">
    <FontAwesomeIcon icon={faDownload} />
    Download App
  </Button>
</a>


              {!user ? (
                <Button
                  variant="outline-primary"
                  className="custom-btn"
                  onClick={() => navigate("/login")}
                >
                  <FontAwesomeIcon icon={faSignInAlt} />
                  Login
                </Button>
              ) : (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-primary" className="custom-btn">
                    <FontAwesomeIcon icon={faUser} />
                    {user.displayName || "User"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item disabled>Email: {user.email}</Dropdown.Item>
                    <Dropdown.Divider />
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
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavbarComponent;
