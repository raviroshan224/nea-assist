import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

import { Container } from 'react-bootstrap';

const PDFViewer = () => {
  const { courseId, subjectId, chapterId } = useParams();
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const fetchPDF = async () => {
      const docRef = doc(db, `courses/${courseId}/subjects/${subjectId}/chapters`, chapterId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPdfUrl(docSnap.data().pdfUrl);
      } else {
        alert('PDF not found');
      }
    };
    fetchPDF();
  }, [courseId, subjectId, chapterId]);

  return (
    <Container className="mt-5">
      <h2>PDF Viewer</h2>
      {pdfUrl ? (
        <iframe src={pdfUrl} width="100%" height="600px" title="PDF"></iframe>
      ) : (
        <p>Loading PDF...</p>
      )}
    </Container>
  );
};

export default PDFViewer;
