import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import DeleteAccountPage from '../page';
import DeleteAccountClient from '../../delete-confirmed/page';

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn()
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

// Mock supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token'
          }
        },
        error: null
      })
    }
  })
}));

// Mock fetch
global.fetch = jest.fn();

describe('DeleteAccountPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (headers as jest.Mock).mockReturnValue({
      get: jest.fn().mockImplementation((key) => {
        if (key === 'x-forwarded-proto') return 'https';
        if (key === 'host') return 'example.com';
        return null;
      })
    });
  });

  it('should redirect when no token is provided', async () => {
    await DeleteAccountPage({ searchParams: {} });
    expect(redirect).toHaveBeenCalledWith(
      '/error?message=Missing cancellation token'
    );
  });

  it('should make API call and render success state on successful deletion', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200
    });

    const result = await DeleteAccountPage({
      searchParams: { token: 'test-token' }
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api/confirm_deletion',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        }),
        body: JSON.stringify({ token: 'test-token' })
      })
    );

    expect(result.type).toBe(DeleteAccountClient);
    expect(result.props).toEqual({ success: true });
  });

  it('should render error state when API call fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const result = await DeleteAccountPage({
      searchParams: { token: 'test-token' }
    });

    expect(result.type).toBe(DeleteAccountClient);
    expect(result.props).toEqual({ error: 'An unexpected error occurred' });
  });

  it('should render error state when API returns non-200 status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const result = await DeleteAccountPage({
      searchParams: { token: 'test-token' }
    });

    expect(result.type).toBe(DeleteAccountClient);
    expect(result.props).toEqual({ success: false });
  });
});
