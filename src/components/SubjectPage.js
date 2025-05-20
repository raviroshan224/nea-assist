import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const years = ['all', 'year1', 'year2', 'year3', 'year4'];
const semesters = ['semester1', 'semester2'];

const colors = {
  primary: '#114B5F',
  secondary: '#028090',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

const SubjectPage = () => {
  const { courseId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  const [hoveredSubjectId, setHoveredSubjectId] = useState(null);

  useEffect(() => {
    const fetchCourseName = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourseName(docSnap.data().name || 'Course');
        }
      } catch (error) {
        console.error('Error fetching course name:', error);
      }
    };

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, `courses/${courseId}/subjects`));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubjects(data);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseName();
    fetchSubjects();
  }, [courseId]);

  const renderAllSubjects = () => (
    <div style={styles.grid}>
      {subjects.map(subject => (
        <Link
          key={subject.id}
          to={`/chapters/${courseId}/${subject.id}`}
          style={styles.link}
          onMouseEnter={() => setHoveredSubjectId(subject.id)}
          onMouseLeave={() => setHoveredSubjectId(null)}
        >
          <div
            style={{
              ...styles.card,
              boxShadow:
                hoveredSubjectId === subject.id
                  ? `0 12px 20px ${colors.shadow}`
                  : `0 6px 14px ${colors.shadow}`,
              transform: hoveredSubjectId === subject.id ? 'translateY(-5px)' : 'translateY(0)',
            }}
          >
            <h4 style={styles.subjectName}>{subject.name}</h4>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderSubjectsBySemester = (year, semester) => {
    const filtered = subjects.filter(
      subject => subject.year === year && subject.semester === semester
    );
    if (filtered.length === 0) return null;

    return (
      <div key={semester} style={styles.semesterSection}>
        <h3 style={styles.semesterTitle}>{semester.replace('semester', 'Semester ')}</h3>
        <div style={styles.grid}>
          {filtered.map(subject => (
            <Link
              key={subject.id}
              to={`/chapters/${courseId}/${subject.id}`}
              style={styles.link}
              onMouseEnter={() => setHoveredSubjectId(subject.id)}
              onMouseLeave={() => setHoveredSubjectId(null)}
            >
              <div
                style={{
                  ...styles.card,
                  boxShadow:
                    hoveredSubjectId === subject.id
                      ? `0 12px 20px ${colors.shadow}`
                      : `0 6px 14px ${colors.shadow}`,
                  transform: hoveredSubjectId === subject.id ? 'translateY(-5px)' : 'translateY(0)',
                }}
              >
                <h4 style={styles.subjectName}>{subject.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{courseName ? `${courseName} Subjects` : 'Subjects'}</h1>

      <div style={styles.filterBar}>
        {years.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            style={{
              ...styles.filterBtn,
              backgroundColor: selectedYear === year ? colors.secondary : 'transparent',
              color: selectedYear === year ? '#fff' : colors.primary,
              border: `1px solid ${selectedYear === year ? colors.secondary : colors.primary}`,
              fontWeight: selectedYear === year ? 600 : 500,
            }}
          >
            {year === 'all' ? 'All' : year.replace('year', 'Year ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={styles.loadingText}>Loading...</p>
      ) : selectedYear === 'all' ? (
        renderAllSubjects()
      ) : (
        semesters.map(sem => renderSubjectsBySemester(selectedYear, sem))
      )}
    </div>
  );
};

const styles = {
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '40px 24px',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
  },
  filterBtn: {
    padding: '10px 20px',
    borderRadius: 24,
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 20,
    color: colors.secondary,
    marginTop: 60,
  },
  semesterSection: {
    marginBottom: 48,
  },
  semesterTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.primary,
    marginBottom: 20,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 24,
  },
  link: {
    textDecoration: 'none',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: '26px 20px',
    minHeight: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    border: `1px solid #e2e8f0`,
  },
  subjectName: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: colors.primary,
    textAlign: 'center',
    margin: 0,
  },
};

export default SubjectPage;
