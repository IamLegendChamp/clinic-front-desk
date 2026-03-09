import type { ButtonProps } from '@mui/material/Button';
import MuiButton from '@mui/material/Button';

/**
 * Custom Button – MUI Button with consistent defaults for use across projects.
 */
export function Button(props: ButtonProps) {
  return (
    <MuiButton
      variant="contained"
      color="primary"
      disableElevation
      {...props}
    />
  );
}
