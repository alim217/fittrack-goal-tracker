import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
} from '@chakra-ui/react';

/**
 * @typedef {object} GoalFormData
 * @property {string} title - The title of the goal.
 * @property {string} description - The description of the goal.
 */

/**
 * @typedef {object} GoalFormProps
 * @property {(formData: GoalFormData) => Promise<void> | void} onSubmit - Callback function invoked when the form is submitted with valid data. Handles the actual API call (create/update) in the parent component. Required.
 * @property {{ title: string, description: string }} [initialData] - Optional. An object containing existing goal data. If provided, the form initializes with these values, indicating an "edit" mode.
 * @property {boolean} isLoading - Indicates if the parent component is currently processing a submission. When true, form inputs are disabled. Required.
 * @property {string} formId - The `id` attribute to be applied directly to the rendered `<form>` element. Required for external submission triggers.
 */

/**
 * A reusable UI form component for creating or editing fitness goals.
 * Captures goal title (required) and description (optional).
 * Handles client-side validation for the title field.
 * Designed to be submitted via an external trigger associated with its `formId`.
 *
 * @param {GoalFormProps} props - The component props.
 * @returns {JSX.Element} The rendered goal form component.
 */
const GoalForm = ({ onSubmit, initialData, isLoading, formId }) => {
  // State for form input values
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // State for client-side validation errors
  const [errors, setErrors] = useState({ title: '' }); // Only title is validated client-side here

  /**
   * Effect to populate form state when initialData is provided (for editing).
   * Runs when initialData prop changes.
   */
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      // Clear any previous errors when initialData changes
      setErrors({ title: '' });
    } else {
      // If initialData becomes null/undefined (e.g., switching from edit to create), reset form
      setTitle('');
      setDescription('');
      setErrors({ title: '' });
    }
    // Dependency array includes initialData to react to its changes
  }, [initialData]);

  /**
   * Validates the form fields. Currently only checks if the title is non-empty.
   * Updates the errors state with relevant messages.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = { title: '' };
    let isValid = true;

    // Title validation (Required)
    if (!title.trim()) {
      newErrors.title = 'Goal title is required.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handles the change event for the title input.
   * Updates the title state and clears the corresponding validation error.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    // Clear error message for title when user starts typing
    if (errors.title) {
      setErrors((prevErrors) => ({ ...prevErrors, title: '' }));
    }
  };

  /**
   * Handles the change event for the description textarea.
   * Updates the description state.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} event - The textarea change event.
   */
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
    // No client-side validation error for description in this implementation
  };

  /**
   * Handles the form submission event.
   * Prevents default submission, validates the form, and calls the onSubmit prop if valid.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default browser form submission

    if (validateForm()) {
      // Call the onSubmit prop passed from the parent component (e.g., DashboardPage)
      // with the current state values.
      onSubmit({ title, description });
    }
  };

  return (
    // Assign the formId prop to the form element's id
    <form id={formId} onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {/* Title Input Field */}
        <FormControl isRequired isInvalid={!!errors.title}>
          <FormLabel htmlFor="goal-title">Title</FormLabel>
          <Input
            id="goal-title"
            name="title"
            placeholder="e.g., Run 5k"
            value={title}
            onChange={handleTitleChange}
            isDisabled={isLoading} // Disable input when loading
            maxLength={150} // Consistent with backend model validation
          />
          {/* Display validation error if it exists */}
          {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
        </FormControl>

        {/* Description Textarea Field */}
        <FormControl>
          <FormLabel htmlFor="goal-description">Description</FormLabel>
          <Textarea
            id="goal-description"
            name="description"
            placeholder="Optional: Add details about your goal..."
            value={description}
            onChange={handleDescriptionChange}
            isDisabled={isLoading} // Disable textarea when loading
            maxLength={500} // Consistent with backend model validation
            rows={3} // Adjust rows as needed
          />
          {/* No FormErrorMessage needed as description is optional */}
        </FormControl>

        {/* No internal submit button - submission controlled externally */}
      </VStack>
    </form>
  );
};

export default GoalForm;