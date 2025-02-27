import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="mt-2">
        <p className="text-gray-600">{message}</p>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          variant="ghost"
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}