# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevTools is a developer toolbox web application with 70+ online tools. It's a React SPA with TypeScript, built with Vite.

## Development Commands

```bash
npm run dev      # Start dev server (usually on port 5173+)
npm run build    # Build for production (tsc + vite build)
npm run preview  # Preview production build
```

## Architecture

### Key Files
- `src/router.tsx` - All routes are defined here using createBrowserRouter
- `src/components/Layout/Navbar.tsx` - Navigation menu with dropdown support
- `src/components/common/index.tsx` - Shared Card and Button components

### Adding a New Tool

1. Create page component in `src/pages/YourTool.tsx`
2. Add import and route in `src/router.tsx`
3. Add navigation item in `src/components/Layout/Navbar.tsx`
   - Import icon from lucide-react
   - Add to appropriate navGroups array

### Component Patterns

**Page structure:**
```tsx
import { Card, Button } from '../components/common';

export default function YourTool() {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="Tool Title">
        {/* Content */}
      </Card>
    </div>
  );
}
```

**Theming:**
- Use CSS variables: `var(--bg-primary)`, `var(--text-primary)`, etc.
- Dark/light theme is handled automatically

### Dependencies
- `lucide-react` - Icons
- `xlsx` - Excel file handling
- `mammoth` - Word document preview
- `crypto-js` - Encryption utilities
- `dayjs` - Date manipulation

## Code Style

- Use inline styles for component styling
- Chinese for UI text (国际化使用中文)
- No comments unless logic is complex
- Keep components in single file unless very large