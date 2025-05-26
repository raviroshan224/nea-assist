import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SubjectPage from './components/SubjectPage';
import ChapterPage from './components/ChapterPage';
import NavbarComponent from './components/NavbarComponent';
import PDFViewer from './components/PDFViewer';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminDashboard from './components/AdminDashboard';
import Layout from './Layout';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminLogin from './components/AdminLogin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import CoursePage from './components/CoursePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Admin Route without Navbar */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* All other routes with Navbar (Layout) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/university/:universityId/courses" element={<CoursePage />} />

          <Route path="/subjects/:courseId" element={<SubjectPage />} />
          <Route path="/chapters/:courseId/:subjectId" element={<ChapterPage />} />
          <Route path="/:courseSlug/:subjectSlug" element={<ChapterPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
