import type { TextFieldProps } from '@mui/material/TextField';
import MuiTextField from '@mui/material/TextField';

/**
 * Custom TextField – MUI TextField with consistent defaults (outlined variant, full width).
 * Outlined avoids label/input overlap and looks clear.
 */
export function TextField(props: TextFieldProps) {
  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      {...props}
    />
  );
}
