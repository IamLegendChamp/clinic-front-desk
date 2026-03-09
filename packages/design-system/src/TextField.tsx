import type { TextFieldProps } from '@mui/material/TextField';
import MuiTextField from '@mui/material/TextField';

/**
 * Custom TextField – MUI TextField with consistent defaults (filled variant, full width).
 */
export function TextField(props: TextFieldProps) {
  return (
    <MuiTextField
      variant="filled"
      fullWidth
      {...props}
    />
  );
}
