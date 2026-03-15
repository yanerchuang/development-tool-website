import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Layout';
import './styles/global.css';
import './styles/components.css';

export default function App() {
  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <main style={{
          marginTop: 'var(--header-height)',
          padding: '20px',
          maxWidth: '1400px',
          marginInline: 'auto',
          minHeight: 'calc(100vh - var(--header-height))',
        }}>
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
}