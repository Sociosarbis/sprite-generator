import { useCallback, useState } from 'react';

export default function useErrorTips() {
  const [errors, setErrors] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const showErrors = useCallback((errs: string[]) => {
    setErrors(errs);
    setOpen(true);
  }, []);
  return {
    errors,
    open,
    setOpen,
    showErrors,
  };
}
