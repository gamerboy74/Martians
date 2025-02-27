import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { getErrorMessage } from '../lib/utils';

interface UseLoadingStateOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const withLoading = useCallback(
    async <T>(
      fn: () => Promise<T>,
      {
        successMessage = options.successMessage,
        errorMessage = options.errorMessage,
      }: UseLoadingStateOptions = {}
    ): Promise<T | undefined> => {
      setIsLoading(true);
      try {
        const result = await fn();
        if (successMessage) {
          toast.success(successMessage);
        }
        return result;
      } catch (error) {
        const message = errorMessage || getErrorMessage(error);
        toast.error(message);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, options.successMessage, options.errorMessage]
  );

  return {
    isLoading,
    withLoading,
  };
}