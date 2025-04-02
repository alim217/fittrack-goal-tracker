<?xml version="1.0" encoding="UTF-8"?>
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Center, // Import Center for spinner placement
} from '@chakra-ui/react';

// Import API client functions
import { getGoals, createGoal } from '../services/apiClient.js';

// Import Child Components (Assume they exist and function as specified)
import GoalList from '../components/GoalList.jsx';
import GoalForm from '../components/GoalForm.jsx'; // Assumes GoalForm renders <form id="goal-form">

/**
 * @typedef {object} GoalFormData
 * @property {string} title
 * @property {string} [description]
 */

/**
 * DashboardPage Component
 *
 * Main view for authenticated users. Displays a list of their fitness goals,
 * handles loading and error states for data fetching, and provides a modal
 * interface for creating new goals using the GoalForm component.
 */
function DashboardPage() {
  // State for storing fetched goals
  const [goals, setGoals] = useState([]);
  // State for tracking loading status during initial goal fetch
  const [isLoading, setIsLoading] = useState(true);
  // State for storing errors encountered during initial goal fetch
  const [fetchError, setFetchError] = useState(null);

  // State and controls for the "Create Goal" modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  // State for tracking submission status of the create goal form
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Chakra UI hook for displaying toast notifications
  const toast = useToast();

  /**
   * Fetches the user's goals from the API when the component mounts.
   * Updates loading and error states accordingly.
   */
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const fetchGoals = async () => {
      setIsLoading(true);
      setFetchError(null); // Clear previous fetch errors
      setGoals([]); // Clear previous goals before fetching

      try {
        const response = await getGoals(); // API call
        if (isMounted) {
          // Check response structure (assuming API returns { goals: [...] })
          if (response && Array.isArray(response.goals)) {
            setGoals(response.goals);
          } else {
            console.error('API response for getGoals did not contain a `goals` array:', response);
            setGoals([]); // Ensure goals is an array even on unexpected response
            setFetchError('Received unexpected data format from server.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch goals:', error);
        // Log detailed error for debugging
        if (error.response) {
          console.error('API Error Response:', {
            status: error.response.status,
            data: error.response.data,
          });
        } else if (error.request) {
          console.error('API No Response:', error.request);
        } else {
          console.error('API Request Setup Error:', error.message);
        }

        if (isMounted) {
          // Set user-friendly error message
          setFetchError(
            error?.response?.data?.message ||
              'Failed to load goals. Please refresh the page or try again later.',
          );
          setGoals([]); // Ensure goals state is empty on error
        }
      } finally {
        if (isMounted) {
          setIsLoading(false); // Always stop loading state
        }
      }
    };

    fetchGoals();

    // Cleanup function to set the mounted flag to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  /**
   * Handles the submission of the "Create Goal" form within the modal.
   * Calls the createGoal API, updates local state, closes the modal,
   * and displays toast notifications for success or failure.
   * @param {GoalFormData} formData - Data submitted from the GoalForm component.
   */
  const handleCreateGoalSubmit = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      // Clear previous submit errors implicitly by relying on toast

      try {
        const response = await createGoal(formData); // API call

        // Check response structure (assuming API returns { goal: {...} })
        if (response && response.goal) {
          // Update goals state optimistically or by appending new goal
          setGoals((prevGoals) => [...prevGoals, response.goal]);
          onClose(); // Close the modal on success

          // Show success toast
          toast({
            title: 'Goal Created',
            description: `Your new goal "${response.goal.title}" has been added.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top',
          });
        } else {
           // Handle unexpected success response format
           console.error('API response for createGoal did not contain a `goal` object:', response);
           throw new Error('Failed to create goal due to unexpected server response.');
        }

      } catch (error) {
        console.error('Failed to create goal:', error);
        // Log detailed error for debugging
        if (error.response) {
          console.error('API Error Response:', {
            status: error.response.status,
            data: error.response.data,
          });
        } else if (error.request) {
          console.error('API No Response:', error.request);
        } else {
          console.error('API Request Setup Error:', error.message);
        }

        // Show error toast
        toast({
          title: 'Creation Failed',
          description:
            error?.response?.data?.message ||
            'Could not create the goal. Please try again.',
          status: 'error',
          duration: 7000,
          isClosable: true,
          position: 'top',
        });
        // Keep the modal open on error so the user can retry/correct
      } finally {
        setIsSubmitting(false); // Always stop submitting state
      }
    },
    [onClose, toast], // Dependencies for useCallback
  );

  /**
   * Renders the main content area based on loading, error, or data state.
   * @returns {JSX.Element} The conditional content to display.
   */
  const renderContent = () => {
    if (isLoading) {
      return (
        <Center p={10}>
          <Spinner size="xl" />
        </Center>
      );
    }

    if (fetchError) {
      return (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      );
    }

    if (goals.length === 0) {
      return (
        <Center p={10}>
           <Text>No goals yet. Create one to get started!</Text>
        </Center>
      );
    }

    return <GoalList goals={goals} />;
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="xl">
          Your Goals
        </Heading>
        <Button onClick={onOpen} colorScheme="teal">
          + Create New Goal
        </Button>
      </Box>

      {/* Render loading, error, or goal list */}
      {renderContent()}

      {/* Create Goal Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Goal</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Render the GoalForm component inside the modal */}
            {/* Assume GoalForm renders <form id="goal-form"> internally */}
            <GoalForm
                onSubmit={handleCreateGoalSubmit}
                isLoading={isSubmitting}
                formId="goal-form" // Pass ID to GoalForm if needed, or ensure it sets it
            />
            {/* Note: Displaying submit errors inside the modal via Alert is possible,
                but using toast provides less intrusive feedback and is preferred here. */}
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} variant="ghost" mr={3}>
              Cancel
            </Button>
            <Button
              type="submit" // Trigger form submission
              form="goal-form" // Associate with the form inside GoalForm
              colorScheme="teal"
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Save Goal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

export default DashboardPage;