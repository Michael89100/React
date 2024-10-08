import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../ressources/logo.webp';
import DarkLight from './DarkLight';

const NavBar = ({ isAuthenticated, handleLogout }) => {

  return (
    <nav className="bg-gray-200 p-4 text-white shadow-md dark:bg-gray-900">
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
          <div>
            <DarkLight />
              
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
