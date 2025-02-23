import { useState, useCallback } from 'react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> => {
      setOptions(options);
      setIsOpen(true);
      return new Promise((res) => {
        setResolve(() => res);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (resolve) {
      resolve(true);
      setIsOpen(false);
      setOptions(null);
      setResolve(null);
    }
  }, [resolve]);

  const handleCancel = useCallback(() => {
    if (resolve) {
      resolve(false);
      setIsOpen(false);
      setOptions(null);
      setResolve(null);
    }
  }, [resolve]);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  };
}