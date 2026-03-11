/**
 * Type declarations for @muibook/components custom elements (React JSX).
 */
import type { HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mui-button': HTMLAttributes<HTMLElement> & {
        type?: string;
        variant?: string;
        disabled?: boolean;
      };
      'mui-input': HTMLAttributes<HTMLElement> & {
        type?: string;
        placeholder?: string;
        value?: string;
        label?: string;
        disabled?: boolean;
        required?: boolean;
      };
    }
  }
}

export {};
