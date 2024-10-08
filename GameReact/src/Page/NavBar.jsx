import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../ressources/logo.webp';

const NavBar = ({ isAuthenticated, handleLogout }) => {
  // Gestion du mode sombre
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme === 'true';
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-md dark:bg-gray-900">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard" className="text-2xl font-bold tracking-wide">
          <img 
            src={logo} 
            alt="Logo"
            className="w-12 h-12" 
          />
        </Link>

        {/* NavBar */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="btn btn-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition duration-300 dark:bg-yellow-400 dark:text-black"
          >
            {darkMode ? 'Mode Clair' : 'Mode Sombre'}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="btn btn-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-gray-300 transition duration-300"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
