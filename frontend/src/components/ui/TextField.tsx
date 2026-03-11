import { useRef, useEffect, createElement, forwardRef, useImperativeHandle } from 'react';
import '@muibook/components/mui-input';

type TextFieldProps = {
  type?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (e: { target: { value: string } }) => void;
  inputProps?: { maxLength?: number; inputMode?: string; pattern?: string };
};

export const TextField = forwardRef<HTMLElement & { value?: string }, TextFieldProps>(function TextField(
  {
    type = 'text',
    label,
    placeholder,
    value,
    disabled,
    required,
    onChange,
    inputProps = {},
  },
  ref
) {
  const innerRef = useRef<HTMLElement & { value?: string }>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLElement & { value?: string }, []);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.setAttribute('type', type);
    if (label != null) el.setAttribute('label', label);
    if (placeholder != null) el.setAttribute('placeholder', placeholder);
    if (disabled != null) {
      if (disabled) el.setAttribute('disabled', '');
      else el.removeAttribute('disabled');
    }
    if (required != null) {
      if (required) el.setAttribute('required', '');
      else el.removeAttribute('required');
    }
    if (inputProps.maxLength != null) el.setAttribute('maxlength', String(inputProps.maxLength));
    if (inputProps.inputMode != null) el.setAttribute('inputmode', inputProps.inputMode);
    if (inputProps.pattern != null) el.setAttribute('pattern', inputProps.pattern);
  }, [type, label, placeholder, disabled, required, inputProps.maxLength, inputProps.inputMode, inputProps.pattern]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const v = String(value ?? '');
    if (value !== undefined && value !== null && 'value' in el && el.value !== v)
      (el as { value: string }).value = v;
  }, [value]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el || !onChange) return;
    const handler = (e: Event) => {
      const target = e.target as HTMLInputElement & { value?: string };
      if (target && 'value' in target) onChange({ target: { value: target.value ?? '' } });
    };
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [onChange]);

  return createElement('mui-input', { ref: innerRef });
});
