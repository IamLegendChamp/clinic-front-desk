import { useRef, useEffect, createElement, type ReactNode } from 'react';
import '@muibook/components/mui-button';

type ButtonProps = {
  type?: 'button' | 'submit';
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function Button({ type = 'button', variant = 'contained', disabled, onClick, children }: ButtonProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute('type', type);
    if (variant === 'outlined') {
      el.setAttribute('variant', 'outlined');
    } else if (variant === 'text') {
      el.setAttribute('variant', 'text');
    }
    if (disabled != null) {
      if (disabled) el.setAttribute('disabled', '');
      else el.removeAttribute('disabled');
    }
  }, [type, variant, disabled]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      if (type === 'submit') {
        const form = (el as HTMLElement).closest('form');
        if (form) {
          e.preventDefault();
          form.requestSubmit();
          return;
        }
      }
      onClick?.();
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [onClick, type]);

  return createElement('mui-button', { ref }, children);
}
