<?xml version="1.0" encoding="UTF-8"?>
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  useToast,
  Center,
  List,
  ListItem,
  ListIcon,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons'; // Using an icon for list items

// Import API client functions
import {
  getGoalById,
  getGoalProgress,
  logProgress,
} from '../services/apiClient.js';

// Import Child Components (Assume it exists and functions as specified)
import ProgressLogForm from '../components/ProgressLogForm.jsx'; // Assuming path

/**
 * @typedef {object} GoalDetails
 * @property {string} _id
 * @property {string} title
 * @property {string} [description]
 * @property {'active' | 'completed'} status
 * @property {string | Date} [targetDate]
 * @property {string | Date} createdAt
 * @property {string | Date} updatedAt
 * // Add other goal fields if expected from API
 */

/**
 * @typedef {object} ProgressLog
 * @property {string} _id
 * @property {string | Date} date
 * @property {string} [notes]
 * @property {number} [value]
 * @property {string | Date} createdAt
 * // Add other progress fields if expected from API
 */

/**
 * @typedef {object} ProgressFormData
 * @property {string | Date} [date]
 * @property {string} [notes]
 * @property {number} [value]
 */


/**
 * GoalDetailPage Component
 *
 * Displays detailed information for a specific fitness goal, including its
 * progress history. Allows users to log new progress entries.
 * Handles loading and error states for data fetching and submission.
 */
function GoalDetailPage() {
  const { goalId } = useParams(); // Extract goalId from URL
  const toast = useToast(); // Hook for displaying notifications

  // --- State Variables ---
  const [goalDetails, setGoalDetails] = useState(/** @type {GoalDetails | null} */ (null));
  const [progressLogs, setProgressLogs] = useState(/** @type {ProgressLog[]} */ ([]));
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
  const [fetchError, setFetchError] = useState(/** @type {string | null} */ (null)); // Error state for initial data fetch
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false); // Loading state for progress submission

  /**
   * Fetches both goal details and progress logs concurrently.
   */
  const fetchData = useCallback(async (currentGoalId) => {
    setIsLoading(true);
    setFetchError(null);
    setGoalDetails(null); // Clear previous details
    setProgressLogs([]); // Clear previous logs

    try {
      const [goalResponse, progressResponse] = await Promise.all([
        getGoalById(currentGoalId),
        getGoalProgress(currentGoalId),
      ]);

      // Validate goal response
      if (goalResponse && goalResponse.goal) {
        setGoalDetails(goalResponse.goal);
      } else {
        console.error('API response for getGoalById did not contain a `goal` object:', goalResponse);
        throw new Error('Received unexpected goal data format from server.');
      }

      // Validate progress response
      if (progressResponse && Array.isArray(progressResponse.progressLogs)) {
        // Sort logs immediately after fetching, newest first
        const sortedLogs = progressResponse.progressLogs.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt).getTime();
            const dateB = new Date(b.date || b.createdAt).getTime();
            return dateB - dateA;
        });
        setProgressLogs(sortedLogs);
      } else {
        console.error('API response for getGoalProgress did not contain a `progressLogs` array:', progressResponse);
        throw new Error('Received unexpected progress data format from server.');
      }

    } catch (error) {
      console.error('Failed to fetch goal details or progress:', error);
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

      // Set user-friendly error message
      let errorMessage = 'Failed to load goal details. Please refresh the page or try again later.';
      if (error?.response?.status === 404) {
          errorMessage = 'Goal not found. It might have been deleted or you may not have permission to view it.';
      } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
      } else if (error?.message) {
           // Use error message if available and not an Axios structure
          errorMessage = error.message;
      }
      setFetchError(errorMessage);
      setGoalDetails(null); // Ensure details are null on error
      setProgressLogs([]); // Ensure logs are empty on error

    } finally {
      setIsLoading(false); // Always stop loading state
    }
  }, []); // No dependencies needed here as goalId is passed directly

  // Effect to fetch data when goalId changes
  useEffect(() => {
    if (goalId) {
      fetchData(goalId);
    } else {
      // Handle case where goalId is somehow missing (though routing should prevent this)
      setFetchError('Goal ID is missing.');
      setIsLoading(false);
    }
  }, [goalId, fetchData]); // Depend on goalId and the fetchData callback

  /**
   * Handles the submission of new progress entries from ProgressLogForm.
   * @param {ProgressFormData} progressData - Data submitted from the form.
   */
  const handleProgressSubmit = useCallback(
    async (progressData) => {
      if (!goalId) return; // Should not happen if component is mounted

      setIsSubmittingProgress(true);
      // Error state for submission is handled via toast

      try {
        const response = await logProgress(goalId, progressData);

        // Validate response structure
        if (response && response.progress) {
            toast({
              title: 'Progress Logged',
              description: 'Your progress entry has been saved.',
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: 'top',
            });

            // Refresh progress logs by refetching
            // Could potentially update state locally if response.progress is reliable
            // For MVP robustness, refetching is safer.
            const progressResponse = await getGoalProgress(goalId);
            if (progressResponse && Array.isArray(progressResponse.progressLogs)) {
                const sortedLogs = progressResponse.progressLogs.sort((a, b) => {
                    const dateA = new Date(a.date || a.createdAt).getTime();
                    const dateB = new Date(b.date || b.createdAt).getTime();
                    return dateB - dateA;
                });
               setProgressLogs(sortedLogs);
            } else {
                // Handle potential error during refetch silently or log it
                 console.error('Failed to refetch progress logs after submission.');
                 // Optionally, attempt local update as fallback if response.progress exists
                 // setProgressLogs(prevLogs => [response.progress, ...prevLogs].sort(...));
            }

        } else {
           console.error('API response for logProgress did not contain a `progress` object:', response);
           throw new Error('Failed to save progress due to unexpected server response.');
        }

      } catch (error) {
        console.error('Failed to log progress:', error);
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

        toast({
          title: 'Submission Failed',
          description:
            error?.response?.data?.message ||
            'Could not save progress entry. Please try again.',
          status: 'error',
          duration: 7000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setIsSubmittingProgress(false); // Always stop submitting state
      }
    },
    [goalId, toast], // Dependencies for useCallback
  );

  // --- Rendering Logic ---

  if (isLoading) {
    return (
      <Center h="60vh"> {/* Adjust height */}
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

  if (!goalDetails) {
     // Should typically be covered by fetchError, but added as a safeguard
    return (
        <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertDescription>Goal details could not be loaded.</AlertDescription>
        </Alert>
    );
  }

  // Format dates simply for display
  const formatDisplayDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleDateString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric'
          });
      } catch (e) {
          return 'Invalid Date';
      }
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Goal Details Section */}
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
        <Heading as="h1" size="lg" mb={2}>
          {goalDetails.title}
        </Heading>
         {/* Display Status and Target Date */}
         <HStack spacing={4} mb={4}>
             <Badge colorScheme={goalDetails.status === 'completed' ? 'green' : 'blue'} fontSize="sm">
                 Status: {goalDetails.status}
             </Badge>
             {goalDetails.targetDate && (
                 <Text fontSize="sm" color="gray.600">
                    Target: {formatDisplayDate(goalDetails.targetDate)}
                 </Text>
             )}
         </HStack>
        {goalDetails.description && (
          <Text color="gray.700" mt={2}>
            {goalDetails.description}
          </Text>
        )}
        {/* Optionally display createdAt/updatedAt */}
        <Text fontSize="xs" color="gray.500" mt={3}>
            Created: {formatDisplayDate(goalDetails.createdAt)}
        </Text>
      </Box>

      <Divider />

      {/* Progress Logging Form Section */}
      <Box>
        <Heading as="h2" size="md" mb={4}>
          Log New Progress
        </Heading>
        <ProgressLogForm
          onSubmit={handleProgressSubmit}
          isLoading={isSubmittingProgress}
          // goalId is implicitly used via handleProgressSubmit closure
        />
      </Box>

      <Divider />

      {/* Progress History Section */}
      <Box>
        <Heading as="h2" size="md" mb={4}>
          Progress History
        </Heading>
        {progressLogs.length === 0 ? (
          <Text color="gray.500">No progress logged yet.</Text>
        ) : (
          <List spacing={4}>
            {progressLogs.map((log) => (
              <ListItem key={log._id} p={4} borderWidth="1px" borderRadius="md" shadow="sm">
                <HStack justifyContent="space-between" mb={2}>
                   <HStack>
                       <ListIcon as={CheckCircleIcon} color="green.500" />
                       <Text fontWeight="bold">
                           {formatDisplayDate(log.date || log.createdAt)}
                       </Text>
                   </HStack>
                   {/* Display metric value if present */}
                   {log.value !== undefined && log.value !== null && (
                      <Badge colorScheme="purple">Value: {log.value}</Badge>
                   )}
                </HStack>
                {log.notes && (
                  <Text fontSize="sm" color="gray.600" pl={6}> {/* Indent notes slightly */}
                    {log.notes}
                  </Text>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </VStack>
  );
}

export default GoalDetailPage;