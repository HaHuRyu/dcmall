"use client";
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleOAuthWrapperProps {
  children: React.ReactNode;
}

const GoogleOAuthWrapper: React.FC<GoogleOAuthWrapperProps> = ({ children }) => {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleOAuthWrapper;