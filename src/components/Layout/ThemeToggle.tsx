import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        padding: 0,
        background: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        color: theme === 'light' ? 'var(--warning)' : 'var(--accent-primary)',
        cursor: 'pointer',
        transition: 'all var(--transition-speed)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {theme === 'light' ? (
        <Moon size={18} style={{ transition: 'transform 0.3s' }} />
      ) : (
        <Sun size={18} style={{ transition: 'transform 0.3s' }} />
      )}
      <style>{`
        button:hover {
          border-color: var(--accent-primary);
          box-shadow: var(--glow-sm);
          transform: scale(1.05);
        }
        button:active {
          transform: scale(0.95);
        }
      `}</style>
    </button>
  );
}