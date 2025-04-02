<?xml version="1.0" encoding="UTF-8"?>
import React, { useState, useCallback } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput, // Using NumberInput for better numeric handling if available and consistent
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  FormErrorMessage,
} from '@chakra-ui/react';

/**
 * @typedef {object} ProgressFormData
 * @property {string} date - The date of the progress entry in 'YYYY-MM-DD' format.
 * @property {string} notes - Optional notes about the progress.
 * @property {number} value - The numerical metric value for the progress.
 */

/**
 * @typedef {object} ProgressLogFormProps
 * @property {(formData: ProgressFormData) => Promise<void> | void} onSubmit - Callback function invoked when the form is submitted with valid data. Handles the actual API call in the parent component (`GoalDetailPage`). Required.
 * @property {boolean} isLoading - Indicates if the parent component is currently processing the submission. When true, form inputs and the submit button are disabled and the button shows a loading state. Required.
 */

/**
 * Gets the current date formatted as 'YYYY-MM-DD'.
 * @returns {string} The formatted date string.
 */
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * A reusable presentational UI form component for logging progress against a fitness goal.
 * Renders fields for Date, Notes (optional), and a required Metric Value.
 * Handles client-side validation for required fields.
 *
 * @param {ProgressLogFormProps} props - The component props.
 * @returns {JSX.Element} The rendered progress logging form component.
 */
const ProgressLogForm = ({ onSubmit, isLoading }) => {
  // State for form input values
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  // Store numeric value as string for input control, convert on submit
  const [value, setValue] = useState('');

  // State for client-side validation errors
  const [errors, setErrors] = useState({ date: '', value: '' });

  /**
   * Validates the form fields (date and value).
   * Updates the errors state with relevant messages.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = useCallback(() => {
    const newErrors = { date: '', value: '' };
    let isValid = true;

    // Date validation (Required)
    if (!date) { // Check if date string is empty
      newErrors.date = 'Date is required.';
      isValid = false;
    } else if (isNaN(Date.parse(date))) { // Check if date string is parseable
      newErrors.date = 'Please enter a valid date.';
      isValid = false;
    }


    // Metric Value validation (Required, must be a number)
    if (!value.trim()) {
      newErrors.value = 'Metric value is required.';
      isValid = false;
    } else if (isNaN(Number(value))) {
      newErrors.value = 'Metric value must be a number.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [date, value]); // Dependencies for validation logic

  /**
   * Handles the change event for the date input.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleDateChange = useCallback((event) => {
    setDate(event.target.value);
    // Clear error message for date when user starts typing/selecting
    if (errors.date) {
      setErrors((prevErrors) => ({ ...prevErrors, date: '' }));
    }
  }, [errors.date]);

  /**
   * Handles the change event for the notes textarea.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} event - The textarea change event.
   */
  const handleNotesChange = useCallback((event) => {
    setNotes(event.target.value);
    // No client-side validation error for notes
  }, []);

  /**
   * Handles the change event for the value input (NumberInput).
   * Note: Chakra's NumberInput passes the value string and value number. We use the string for direct control.
   * @param {string} valueAsString - The value as a string from NumberInput.
   * @param {number} valueAsNumber - The value as a number from NumberInput.
   */
  const handleValueChange = useCallback((valueAsString) => {
    setValue(valueAsString); // Keep the string representation in state
    // Clear error message for value when user starts typing
    if (errors.value) {
      setErrors((prevErrors) => ({ ...prevErrors, value: '' }));
    }
  }, [errors.value]);


  /**
   * Handles the form submission event.
   * Prevents default submission, validates the form, and calls the onSubmit prop if valid.
   * Converts the value state (string) to a number before calling onSubmit.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleSubmit = useCallback((event) => {
    event.preventDefault(); // Prevent default browser form submission

    if (validateForm()) {
      const numericValue = parseFloat(value); // Convert validated string value to number
      // Double-check conversion in case validateForm logic changes
      if (!isNaN(numericValue)) {
        onSubmit({ date, notes, value: numericValue });
         // Optionally clear form fields after successful validation trigger
         // Consider if parent should control clearing or if it happens on success toast/refresh
         // setDate(getTodayDateString());
         // setNotes('');
         // setValue('');
         // setErrors({ date: '', value: ''});
      } else {
          // This case should theoretically not be reached if validateForm is correct
          console.error("Validation passed, but value is not a parseable number:", value);
          setErrors(prev => ({ ...prev, value: 'Metric value must be a valid number.' }));
      }
    }
  }, [validateForm, onSubmit, date, notes, value]); // Include all state values used in submit logic


  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {/* Date Input Field */}
        <FormControl isRequired isInvalid={!!errors.date}>
          <FormLabel htmlFor="progress-date">Date</FormLabel>
          <Input
            id="progress-date"
            name="date"
            type="date"
            value={date}
            onChange={handleDateChange}
            isDisabled={isLoading}
          />
          {errors.date && <FormErrorMessage>{errors.date}</FormErrorMessage>}
        </FormControl>

        {/* Notes Textarea Field */}
        <FormControl>
          <FormLabel htmlFor="progress-notes">Notes</FormLabel>
          <Textarea
            id="progress-notes"
            name="notes"
            placeholder="Optional: Add details about your progress..."
            value={notes}
            onChange={handleNotesChange}
            isDisabled={isLoading}
            maxLength={500} // Consistent with backend Progress model validation
            rows={3}
          />
          {/* No error message needed as notes are optional */}
        </FormControl>

        {/* Metric Value Input Field */}
        {/* Using NumberInput for better UX with numeric entry */}
        <FormControl isRequired isInvalid={!!errors.value}>
          <FormLabel htmlFor="progress-value">Metric Value</FormLabel>
          <NumberInput
              id="progress-value"
              value={value} // Controlled by string state
              onChange={handleValueChange} // Updates string state
              isDisabled={isLoading}
              precision={2} // Allow decimals, adjust as needed
              step={0.1} // Adjust step as needed
          >
            <NumberInputField placeholder="Enter value (e.g., reps, minutes, kg)"/>
             {/* Optional: Add steppers for convenience */}
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          {errors.value && <FormErrorMessage>{errors.value}</FormErrorMessage>}
        </FormControl>

        {/* Submit Button */}
        <Button
          type="submit"
          colorScheme="teal"
          width="full" // Make button full width for consistency? Check other forms. Assuming yes.
          isLoading={isLoading}
          loadingText="Logging..." // Text shown when isLoading is true
          isDisabled={isLoading} // Disable button when loading
          mt={4} // Add margin top consistent with AuthForm
        >\n          Log Progress\n        </Button>
      </VStack>
    </form>
  );
};

export default ProgressLogForm;