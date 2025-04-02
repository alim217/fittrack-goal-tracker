<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE structure SYSTEM "https://www.swissprot.org/structure.dtd">
<structure>
import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  Text,
  Link, // Using Link component from Chakra for consistent styling, behavior is handled by onClick
} from '@chakra-ui/react';

// Import the custom hook to access authentication context
import { useAuth } from '../context/AuthContext.jsx';

// Assume AuthForm component exists and adheres to the specified props interface
// Example: import AuthForm from '../components/AuthForm.jsx';
// For this file generation, we'll assume it's correctly imported if placed in the specified path.
// If AuthForm is not provided yet, this import path would need verification.
import AuthForm from '../components/AuthForm.jsx'; // Assuming path

/**
 * @typedef {import('../context/AuthContext.jsx').Credentials} Credentials
 */

/**
 * AuthPage Component
 *
 * Renders the Login/Registration page UI.
 * Allows users to switch between login and registration modes.
 * Displays authentication forms via the AuthForm component.
 * Handles form submissions by calling context functions (login/register).
 * Displays error messages provided by the AuthContext.
 */
function AuthPage() {
  // Local state to manage whether the user is logging in or registering
  const [mode, setMode] = useState('login'); // Default to 'login'

  // Access authentication functions and state from AuthContext
  // Note: We don't need isAuthenticated here as App.jsx handles redirection
  const { login, register, isLoading, error } = useAuth();

  /**
   * Handles form submission from the AuthForm component.
   * Calls the appropriate context function (login or register) based on the current mode.
   * Wrapped in useCallback for potential memoization benefits if passed deeply.
   * @param {Credentials} formData - The email and password submitted from AuthForm.
   */
  const handleFormSubmit = useCallback(
    async (formData) => {
      if (mode === 'login') {
        await login(formData);
        // No need for navigation here, App.jsx handles redirect on auth success
      } else {
        await register(formData);
        // No need for navigation here, App.jsx handles redirect on auth success
      }
    },
    [mode, login, register], // Dependencies for the callback
  );

  /**
   * Toggles the authentication mode between 'login' and 'register'.
   * Wrapped in useCallback.
   */
  const toggleMode = useCallback(() => {
    setMode((prevMode) => (prevMode === 'login' ? 'register' : 'login'));
    // Note: Clearing the error state from context when toggling might be desirable UX,
    // but currently AuthContext clears error on new login/register attempts.
  }, []); // No dependencies needed

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="80vh" // Adjust height as needed for vertical centering
    >
      <Box
        p={8}
        maxWidth="400px" // Constrain width for better form presentation
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        width="100%" // Ensure it takes up available width up to maxWidth
      >
        <VStack spacing={6} align="stretch">
          {/* Heading changes based on the current mode */}
          <Heading as="h1" size="lg" textAlign="center">
            {mode === 'login' ? 'Login' : 'Register'}
          </Heading>

          {/* Display error messages if they exist in the auth context */}
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Render the AuthForm component, passing required props */}
          <AuthForm
            onSubmit={handleFormSubmit}
            mode={mode}
            isLoading={isLoading}
          />

          {/* Text and Link/Button to toggle between login and register modes */}
          <Box textAlign="center">
            <Text as="span">
              {mode === 'login'
                ? 'Need an account? '
                : 'Already have an account? '}
            </Text>
            <Link onClick={toggleMode} color="teal.500" fontWeight="bold" cursor="pointer">
              {mode === 'login' ? 'Register' : 'Login'}
            </Link>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default AuthPage;