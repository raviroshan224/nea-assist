import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // ✅ make sure this is here

const HomePage = () => {
  const navigate = useNavigate(); // ✅ make sure this is inside your component

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'courses'));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCourses(data);
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCardClick = (courseId) => {
    navigate(`/subjects/${courseId}`); // ✅ navigate to subject page
  };
  const getCardStyle = (courseId) => ({
    ...styles.card,
    boxShadow:
      hoveredCard === courseId
        ? '0 10px 20px rgba(0, 0, 0, 0.15)'
        : '0 4px 12px rgba(0, 0, 0, 0.06)',
    transform: hoveredCard === courseId ? 'translateY(-4px)' : 'translateY(0)',
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading courses...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>No courses available yet. Stay tuned!</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Explore Our Courses</h1>
      <div style={styles.grid}>
        {courses.map((course) => (
          <div
            key={course.id}
            style={getCardStyle(course.id)}
            onMouseEnter={() => setHoveredCard(course.id)}
            onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => handleCardClick(course.id)} // ✅ Navigate on click

          >
            <span style={styles.courseName}>{course.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '60px 20px',
    maxWidth: 1200,
    margin: '0 auto',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: 'transparent', // No background color
  },
  title: {
    fontSize: '2.4rem',
    fontWeight: 700,
    color: '#031539', // navyBlue
    textAlign: 'center',
    marginBottom: 50,
  },
  grid: {
    display: 'grid',
    gap: 30,
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  },
  card: {
    background: '#ffffff',
    borderRadius: 14,
    padding: '42px 24px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #eaeaea',
  },
  courseName: {
    fontSize: '1.4rem',
    fontWeight: 600,
    color: '#3A773C', // darkGreen
    textAlign: 'center',
  },
  loadingContainer: {
    minHeight: '80vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontSize: '1.25rem',
    color: '#444',
  },
};

export default HomePage;
