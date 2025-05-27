import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [universities, setUniversities] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'universities'));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Separate into universities and boards
        const universityList = data.filter((item) => item.type === 'university');
        const boardList = data.filter((item) => item.type === 'board');

        setUniversities(universityList);
        setBoards(boardList);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/university/${id}/courses`);
  };

  const getCardStyle = (id, type) => ({
    ...styles.card,
    borderLeft: type === 'board' ? '6px solid #0099CC' : '6px solid #28a745',
    backgroundColor: type === 'board' ? '#e6f7ff' : '#eafaf1',
    boxShadow:
      hoveredCard === id
        ? '0 10px 20px rgba(0, 0, 0, 0.15)'
        : '0 4px 12px rgba(0, 0, 0, 0.06)',
    transform: hoveredCard === id ? 'translateY(-4px)' : 'translateY(0)',
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* University Section */}
      <h1 style={styles.title}>Explore University</h1>
      {universities.length === 0 ? (
        <p style={styles.emptyText}>No universities available yet. Stay tuned!</p>
      ) : (
        <div style={styles.grid}>
          {universities.map((uni) => (
            <div
              key={uni.id}
              style={getCardStyle(uni.id, uni.type)}
              onMouseEnter={() => setHoveredCard(uni.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(uni.id)}
            >
              <div style={styles.cardContent}>
                <span style={styles.courseName}>{uni.name}</span>
                <span style={styles.tag}>🎓 University Level</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Board Section */}
      <h1 style={{ ...styles.title, marginTop: 60 }}>Explore Board </h1>
      {boards.length === 0 ? (
        <p style={styles.emptyText}>No boards available.</p>
      ) : (
        <div style={styles.grid}>
          {boards.map((board) => (
            <div
              key={board.id}
              style={getCardStyle(board.id, board.type)}
              onMouseEnter={() => setHoveredCard(board.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(board.id)}
            >
              <div style={styles.cardContent}>
                <span style={styles.courseName}>{board.name}</span>
                <span style={styles.tag}>📘 Board Level</span>
              </div>
            </div>
          ))}
        </div>
      )}
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
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#031539',
    // textAlign: 'centers
    marginBottom: 50,
  },
  grid: {
  display: 'grid',
  gap: 30,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 320px))',
  justifyContent: 'start', // optional to force left-aligned grid items
},

  card: {
    borderRadius: 14,
    padding: '36px 24px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 340, // fixed max width for better consistency
    margin: '0 auto', // center card within grid cell
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // optional for visual enhancement
  },
  cardContent: {
    // textAlign: 'center',
  },
  courseName: {
    fontSize: '1.4rem',
    fontWeight: 600,
    color: '#333',
    display: 'block',
    marginBottom: 8,
  },
  tag: {
    fontSize: '0.9rem',
    color: '#555',
    fontStyle: 'italic',
  },
  loadingContainer: {
    minHeight: '80vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: '1.25rem',
    color: '#444',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1.1rem',
  },
};


export default HomePage;
