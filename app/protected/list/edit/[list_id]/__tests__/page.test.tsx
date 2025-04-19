import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from '../page';
import { useRouter, useParams } from 'next/navigation';

// Mock modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

// Mock fetch for API calls
global.fetch = jest.fn();

const mockUser = { id: 'user1', email: 'user@example.com' };
const mockListId = '123e4567-e89b-12d3-a456-426614174000'; // Valid UUID format
const mockList = {
  id: mockListId,
  title: 'Test List',
  description: 'Test Description',
  user_id: 'user1'
};
const mockLinks = [
  {
    id: 'link1',
    title: 'Link 1',
    url: 'https://example.com'
  }
];

describe('EditListPage', () => {
  const mockRouterPush = jest.fn();

  beforeAll(() => {
    (useParams as jest.Mock).mockReturnValue({ list_id: mockListId });
  });

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/user')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockUser })
        });
      }
      if (url.includes(`/api/lists/${mockListId}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ list: mockList })
        });
      }
      if (url.includes('/api/links')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ links: mockLinks })
        });
      }
      return Promise.reject(new Error(`Unhandled fetch mock for ${url}`));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders EditListPage correctly', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-list-header')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test List')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByTestId('link-title-0')).toBeInTheDocument();
      expect(screen.getByTestId('link-url-0')).toBeInTheDocument();
    });
  });

  test('handles form submission', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-list-header')).toBeInTheDocument();
      expect(screen.getByTestId('list-title-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('list-title-input'), {
      target: { value: 'Updated List' }
    });
    fireEvent.change(screen.getByTestId('list-description-input'), {
      target: { value: 'Updated Description' }
    });
    fireEvent.click(screen.getByTestId('update-list-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/lists/${mockListId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: 'Updated List',
            description: 'Updated Description',
            links: mockLinks.map(({ title, url, id }) => ({
              title,
              url,
              ...(id && { id })
            }))
          })
        })
      );
      expect(mockRouterPush).toHaveBeenCalledWith(`/list/view/${mockListId}`);
    });
  });

  test('handles link deletion', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-list-header')).toBeInTheDocument();
      expect(screen.getByTestId('list-title-input')).toBeInTheDocument();
      expect(screen.queryByTestId('link-title-0')).toBeInTheDocument();
      expect(screen.queryByTestId('link-url-0')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-link-0-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('link-title-0')).not.toBeInTheDocument();
      expect(screen.queryByTestId('link-url-0')).not.toBeInTheDocument();
    });
  });

  test('handles list deletion', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-list-header')).toBeInTheDocument();
      expect(screen.getByTestId('list-title-input')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-list-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/lists/${mockListId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      expect(mockRouterPush).toHaveBeenCalledWith('/protected');
    });
  });
});
