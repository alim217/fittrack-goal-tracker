import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Stack,
  Card,
  CardBody,
  Heading,
  Text,
  LinkBox,
  LinkOverlay,
  Center,
  Badge,
} from '@chakra-ui/react';

/**
 * @typedef {object} Goal - Represents a single fitness goal object.
 * @property {string} _id - The unique identifier for the goal (used for key prop and navigation).
 * @property {string} title - The main title of the fitness goal.
 * @property {string} [description] - An optional description providing more details about the goal.
 * @property {'active' | 'completed'} [status] - An optional status indicator for the goal.
 * // Add any other relevant fields observed in the data structure passed from DashboardPage.
 */

/**
 * @typedef {object} GoalListProps - Props for the GoalList component.
 * @property {Goal[] | null | undefined} goals - An array of goal objects to be displayed. Handles null or undefined gracefully for loading/error states in parent.
 */

/**
 * GoalList Component
 *
 * Renders a list of fitness goals using Chakra UI components.
 * Each goal links to its corresponding detail page.
 * Displays an empty state message if no goals are provided.
 *
 * @param {GoalListProps} props - The component props.
 * @returns {JSX.Element} The rendered list of goals or an empty state message.
 */
function GoalList({ goals }) {
  // Empty State Handling: Check for null, undefined, or empty array
  if (!goals || goals.length === 0) {
    return (
      <Center p={10}>
        <Text>No goals yet. Create one to get started!</Text>
      </Center>
    );
  }

  // Goal Items Rendering
  return (
    <Stack spacing={4} data-testid="goal-list">
      {goals.map((goal) => (
        // Root element with unique key prop
        <LinkBox
          key={goal._id}
          as={Card} // Render the LinkBox itself as a Card container
          variant="outline"
          shadow="sm"
          _hover={{ shadow: 'md', borderColor: 'teal.500' }} // Add hover effect
          transition="all 0.2s ease-in-out"
        >
          <CardBody>
            <Heading size="md" mb={2}>
              {/* LinkOverlay makes the heading the primary link target */}
              <LinkOverlay as={RouterLink} to={`/goal/${goal._id}`}>
                {goal.title}
              </LinkOverlay>
            </Heading>

            {/* Optional: Display Status Badge */}
            {goal.status && (
              <Badge
                mb={3} // Add margin bottom for spacing
                colorScheme={goal.status === 'completed' ? 'green' : 'blue'}
              >
                {goal.status}
              </Badge>
            )}

            {/* Optional: Display Truncated Description */}
            {goal.description && (
              <Text noOfLines={2} fontSize="sm" color="gray.600">
                {goal.description}
              </Text>
            )}
          </CardBody>
        </LinkBox>
      ))}
    </Stack>
  );
}

export default GoalList;