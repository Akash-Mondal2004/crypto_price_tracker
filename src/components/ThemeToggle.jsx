import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { isDark, setIsDark } = useContext(ThemeContext);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-gray-200 dark:bg-dark-secondary"
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};