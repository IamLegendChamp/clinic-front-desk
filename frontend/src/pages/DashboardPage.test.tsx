import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'staff@clinic.com', role: 'staff' },
    logout: vi.fn(),
  }),
}));

describe('DashboardPage', () => {
  it('shows Front Desk heading', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Front Desk' })).toBeInTheDocument();
  });
});
