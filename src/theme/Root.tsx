import React from 'react';
import LayoutProvider from '../components/LayoutProvider';
import { AuthProvider } from '../contexts/AuthContext';

// Default implementation, that you can customize
const Root = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <LayoutProvider>
        {children}
      </LayoutProvider>
    </AuthProvider>
  );
};

export default Root;