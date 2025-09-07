import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import SignInPage from '../page';

// Mock the modules
jest.mock('next/navigation');
jest.mock('next-auth/react');

const mockPush = jest.fn();
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('SignInPage', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      pathname: '/auth/signin',
      query: {},
      asPath: '/auth/signin',
    } as any);

    mockGetSession.mockResolvedValue(null);
    mockSignIn.mockResolvedValue({ error: undefined } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sign in form', () => {
    render(<SignInPage />);

    expect(
      screen.getByText(/welcome to claude code todo/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sign in to manage your tasks/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
  });

  it('calls signIn when Google button is clicked', async () => {
    render(<SignInPage />);

    const googleButton = screen.getByRole('button', {
      name: /continue with google/i,
    });

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('google', {
        callbackUrl: '/dashboard',
      });
    });
  });

  it('shows loading state when signing in', async () => {
    // Make signIn take some time to resolve
    mockSignIn.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<SignInPage />);

    const googleButton = screen.getByRole('button', {
      name: /continue with google/i,
    });

    fireEvent.click(googleButton);

    // Should show loading state
    expect(googleButton).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('disabled');
  });

  it('redirects to dashboard if already authenticated', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      expires: '2024-12-31',
    });

    render(<SignInPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles sign in errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSignIn.mockRejectedValue(new Error('Sign in failed'));

    render(<SignInPage />);

    const googleButton = screen.getByRole('button', {
      name: /continue with google/i,
    });

    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Sign in error:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
