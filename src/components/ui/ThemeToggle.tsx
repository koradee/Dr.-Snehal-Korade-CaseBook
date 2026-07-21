'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative inline-flex items-center justify-center
        w-9 h-9 rounded-lg
        transition-all duration-200
        hover:scale-105 active:scale-95
        ${className}
      `}
      style={{
        background: isDark ? 'rgba(77, 196, 224, 0.12)' : 'rgba(26, 107, 138, 0.08)',
        color: isDark ? '#4DC4E0' : '#1A6B8A',
        border: `1px solid ${isDark ? 'rgba(77, 196, 224, 0.2)' : 'rgba(26, 107, 138, 0.15)'}`,
      }}
    >
      <span
        className="transition-all duration-300"
        style={{ opacity: 1, transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}
      >
        {isDark ? (
          <SunIcon width={iconSize} height={iconSize} />
        ) : (
          <MoonIcon width={iconSize} height={iconSize} />
        )}
      </span>
    </button>
  );
}
