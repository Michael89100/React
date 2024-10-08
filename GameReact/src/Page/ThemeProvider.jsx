import React, { useState, useEffect } from 'react';

// Créez un contexte pour le thème
export const ThemeContext = React.createContext();

export const ThemeProvider = ({ children }) => {
  // Vérifier le thème stocké dans le localStorage
  const storedTheme = localStorage.getItem('theme');

  // Définir le thème initial en fonction du localStorage ou du mode par défaut (light)
  const [theme, setTheme] = useState(storedTheme ? storedTheme : 'light');

  // Sauvegarder le thème dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme); // Ajouter un attribut pour appliquer le thème à l'ensemble de l'app
  }, [theme]);

  // Basculer entre le mode light et dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};