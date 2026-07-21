import React from 'react';
import '@/app/globals.css';

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  // A completely bare layout to prevent the AppShell, ThemeProvider, or other 
  // dashboard components from wrapping the print view.
  return (
    <html lang="en" className="light">
      <body style={{ background: '#fff', color: '#000', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
