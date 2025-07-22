import React, { useState } from 'react';

// SVG for the Google Icon
const GoogleIcon = () => (
  <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.226-11.283-7.94l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.863 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

// Custom Logo SVG
// This is an abstract logo representing "Google Claude" or a modern tech concept.
const CustomLogo = () => (
    <svg height="80" width="80" viewBox="0 0 100 100" className="mx-auto mb-4">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#4F46E5', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#A855F7', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <path 
            d="M50 2 a 48 48 0 0 1 0 96 a 48 48 0 0 1 0 -96" 
            fill="none" 
            stroke="url(#logoGradient)" 
            strokeWidth="4" 
        />
        <path 
            d="M30 50 a 20 20 0 0 1 40 0" 
            fill="none" 
            stroke="url(#logoGradient)" 
            strokeWidth="4" 
            strokeLinecap="round"
        />
        <circle cx="50" cy="30" r="6" fill="url(#logoGradient)" />
    </svg>
);


export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  // This function would handle the actual Google Sign-In logic.
  // It requires setting up a project with Google Cloud Platform and using a library like 'react-google-login' or Firebase Authentication.
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    console.log("Initiating Google Sign-In...");
    // In a real application, you would call your Google Auth provider here.
    // For demonstration, we'll just simulate a network delay.
    setTimeout(() => {
      console.log("Sign-In complete (simulated).");
      setIsLoading(false);
      // Here you would redirect the user or update the application state.
    }, 2000);
  };

  return (
    // Main container with a dark background and centered content
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      <div className="w-full max-w-md">
        
        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105">
          
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <CustomLogo />
            <h1 className="text-3xl font-bold text-gray-100">
              تسجيل الدخول إلى حسابك
            </h1>
            <p className="text-gray-400 mt-3">
              استخدم حساب Google الخاص بك للمتابعة. تصميم عصري وآمن لتجربة فريدة.
            </p>
          </div>
          
          {/* Google Sign-In Button */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`
                w-full flex items-center justify-center px-4 py-3 
                border border-gray-600 rounded-lg 
                bg-gray-700 hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500
                transition-all duration-300 ease-in-out
                ${isLoading ? 'cursor-not-allowed opacity-60' : ''}
              `}
            >
              {isLoading ? (
                // Loading spinner
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <GoogleIcon />
              )}
              <span className="font-semibold">
                {isLoading ? 'جاري التسجيل...' : 'تسجيل الدخول باستخدام جوجل'}
              </span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Claude-Google Demo. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}
