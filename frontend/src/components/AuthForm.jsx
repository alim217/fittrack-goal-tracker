import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';

/**
 * @typedef {object} AuthFormProps
 * @property {(formData: { email: string, password: string }) => Promise<void> | void} onSubmit - Callback function invoked when the form is submitted with valid data. Handles the actual login/register API call in the parent component.
 * @property {'login' | 'register'} mode - Determines the form's mode, affecting button text and potentially labels/validation.
 * @property {boolean} isLoading - Indicates if an authentication operation (login/register) is in progress. Used to disable the form and show loading state.
 */

/**
 * A reusable UI form component for collecting email and password credentials.
 * Handles basic client-side validation and delegates submission logic to the parent.
 *
 * @param {AuthFormProps} props - The component props.
 * @returns {JSX.Element} The rendered authentication form component.
 */
const AuthForm = ({ onSubmit, mode, isLoading }) => {
  // State for input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for validation errors
  const [errors, setErrors] = useState({ email: '', password: '' });

  /**
   * Validates the form fields (email and password).
   * Updates the errors state with relevant messages.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      // Basic email format check
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 8) {
      // Consistent with backend User model validation
      newErrors.password = 'Password must be at least 8 characters long.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handles the change event for the email input.
   * Updates the email state and clears the corresponding validation error.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    // Clear error message for email when user starts typing
    if (errors.email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
    }
  };

  /**
   * Handles the change event for the password input.
   * Updates the password state and clears the corresponding validation error.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    // Clear error message for password when user starts typing
    if (errors.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
    }
  };

  /**
   * Handles the form submission event.
   * Prevents default submission, validates the form, and calls the onSubmit prop if valid.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default browser form submission

    if (validateForm()) {
      // Call the onSubmit prop passed from the parent component (e.g., AuthPage)
      onSubmit({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {/* Email Input Field */}
        <FormControl isRequired isInvalid={!!errors.email}>
          <FormLabel htmlFor="email">Email Address</FormLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={handleEmailChange}
            isDisabled={isLoading} // Disable input when loading
          />
          {/* Display validation error if it exists */}
          {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
        </FormControl>

        {/* Password Input Field */}
        <FormControl isRequired isInvalid={!!errors.password}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={handlePasswordChange}
            isDisabled={isLoading} // Disable input when loading
          />
          {/* Display validation error if it exists */}
          {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
        </FormControl>

        {/* Submit Button */}
        <Button
          type="submit"
          colorScheme="teal"
          width="full"
          isLoading={isLoading} // Show loading spinner on button
          isDisabled={isLoading} // Disable button when loading
          mt={4} // Add some margin top
        >
          {/* Dynamically set button text based on the mode */}
          {mode === 'login' ? 'Login' : 'Register'}
        </Button>
      </VStack>
    </form>
  );
};

export default AuthForm;