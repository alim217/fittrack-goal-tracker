import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

// Assuming AuthProvider exists and manages authentication state
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';

// --- DOM Target ---
const rootElement = document.getElementById('root');

// --- Application Rendering ---
if (rootElement) {
  // Create a root instance using the DOM element
  const root = ReactDOM.createRoot(rootElement);

  // Render the application within StrictMode and necessary providers
  root.render(
    <StrictMode>
      <BrowserRouter>
        {/* AuthProvider wraps ChakraProvider and App to provide auth context */}
        <AuthProvider>
          {/* ChakraProvider provides UI theme and components */}
          <ChakraProvider>
            {/* App is the root component containing routing and layout */}
            <App />
          </ChakraProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
} else {
  // Log an error if the root element is not found in index.html
  console.error("Fatal Error: Root element with ID 'root' not found in the DOM. React application cannot be mounted.");
}