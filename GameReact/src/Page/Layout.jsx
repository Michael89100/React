import React from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';

const Layout = ({ isAuthenticated, handleLogout, children }) => {
  const location = useLocation();
  
  const showNavBar = location.pathname !== '/login' && location.pathname !== '/signup';

  return (
    <div>
      {showNavBar && <NavBar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />}
      {children}
    </div>
  );
};

export default Layout;
