import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useState, useRef, useEffect } from 'react';

const themes = [
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'light', name: 'Light', icon: Sun },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: Palette },
  { id: 'neon', name: 'Neon', icon: Palette },
];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = themes.find(t => t.id === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-theme-secondary hover:text-theme-primary transition-colors bg-theme-card rounded-full border border-theme-border"
        title="Change Theme"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 glass-card rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
          <div className="py-1">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-theme-hover transition-colors ${
                    theme === t.id ? 'text-blue-500 font-medium' : 'text-theme-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
