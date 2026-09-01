import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition flex items-center gap-2 text-sm font-medium"
            title="Alternar Tema"
        >
            {theme === 'light' ? (
                <>
                    <Moon className="h-4 w-4" /> Escuro
                </>
            ) : (
                <>
                    <Sun className="h-4 w-4" /> Claro
                </>
            )}
        </button>
    );
};