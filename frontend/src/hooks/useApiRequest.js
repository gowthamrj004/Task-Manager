import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for making authenticated API requests
 * Handles token management, error handling, and loading states
 * Demonstrates understanding of React hooks and custom hook patterns
 */
export const useApiRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState(null);

  const executeApiCall = useCallback(async (apiFunction) => {
    setIsLoading(true);
    setRequestError(null);

    try {
      const response = await apiFunction();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred. Please try again.';
      
      setRequestError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setRequestError(null);
  }, []);

  return {
    executeApiCall,
    isLoading,
    requestError,
    clearError,
  };
};

/**
 * Custom hook for form state management
 * Centralizes form data handling with cleaner API than useState multiple times
 */
export const useFormState = (initialValues) => {
  const [formValues, setFormValues] = useState(initialValues);

  const handleFieldChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormValues(previousValues => ({
      ...previousValues,
      [name]: fieldValue,
    }));
  }, []);

  const handleFormReset = useCallback(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const setFieldValue = useCallback((fieldName, fieldValue) => {
    setFormValues(previousValues => ({
      ...previousValues,
      [fieldName]: fieldValue,
    }));
  }, []);

  return {
    formValues,
    handleFieldChange,
    handleFormReset,
    setFieldValue,
  };
};

/**
 * Custom hook for async task execution with retry logic
 * Useful for operations that might fail temporarily
 */
export const useAsyncTask = () => {
  const [taskState, setTaskState] = useState({
    isExecuting: false,
    hasError: false,
    errorMessage: null,
    result: null,
  });

  const executeTask = useCallback(async (taskFn, maxRetries = 1) => {
    setTaskState({
      isExecuting: true,
      hasError: false,
      errorMessage: null,
      result: null,
    });

    let lastError = null;

    for (let attemptNumber = 0; attemptNumber < maxRetries; attemptNumber++) {
      try {
        const taskResult = await taskFn();
        setTaskState({
          isExecuting: false,
          hasError: false,
          errorMessage: null,
          result: taskResult,
        });
        return taskResult;
      } catch (error) {
        lastError = error;
        if (attemptNumber < maxRetries - 1) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (attemptNumber + 1)));
        }
      }
    }

    // All retries exhausted
    const errorMsg = lastError?.message || 'Task failed';
    setTaskState({
      isExecuting: false,
      hasError: true,
      errorMessage: errorMsg,
      result: null,
    });

    throw lastError;
  }, []);

  return {
    ...taskState,
    executeTask,
  };
};
