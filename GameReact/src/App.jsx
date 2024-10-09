import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './Page/Connexion';
import SignupForm from './Page/Inscription';
import Dashboard from './Page/Dashboard';
import Layout from './Page/Layout'; 
import ChessGame from './Page/ChessGame'; 
import { ThemeProvider } from './Page/ThemeProvider';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false); 
  };

  const handleLogin = () => {
    setIsAuthenticated(true); 
  };

  const handleSignup = () => {
    setIsAuthenticated(true); 
  };

  return (
    <ThemeProvider>
      <Router>
        <Layout isAuthenticated={isAuthenticated} handleLogout={handleLogout}>
          <Routes>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} /> 
            <Route path="/signup" element={<SignupForm onSignup={handleSignup} />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            {/* Ajout des routes pour le jeu d'échecs */}
            <Route path="/game/:gameId" element={isAuthenticated ? <ChessGame /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
