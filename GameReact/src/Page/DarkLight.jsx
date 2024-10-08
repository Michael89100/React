import React, { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export default function ToggleThemeButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-6 h-6 text-gray-800" />
      ) : (
        <SunIcon className="w-6 h-6 text-yellow-400" />
      )}
    </button>
  );
}