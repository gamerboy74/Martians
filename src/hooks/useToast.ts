import { useApp } from '../context/AppContext';

export function useToast() {
  const { addNotification, removeNotification } = useApp();

  const toast = {
    success: (message: string) => {
      const id = Date.now().toString();
      addNotification({
        id,
        type: 'success',
        message,
      });
      return id;
    },
    error: (message: string) => {
      const id = Date.now().toString();
      addNotification({
        id,
        type: 'error',
        message,
      });
      return id;
    },
    info: (message: string) => {
      const id = Date.now().toString();
      addNotification({
        id,
        type: 'info',
        message,
      });
      return id;
    },
    dismiss: (id: string) => {
      removeNotification(id);
    },
  };

  return toast;
}