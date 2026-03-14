import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login'; // Đảm bảo bạn đã import Login
import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Mặc định khi vào web sẽ tự chuyển hướng đến trang Login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/admin" element={<DocumentUpload />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;