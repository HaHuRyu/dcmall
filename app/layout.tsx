// app/layout.tsx

import { ReactNode } from 'react';
import AuthContext from './context/AuthContext'; // Import your context provider

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>My App</title>
        {/* Add any other head elements like meta tags here */}
      </head>
      <body>
        <AuthContext>
          {children}
        </AuthContext>
      </body>
    </html>
  );
}
