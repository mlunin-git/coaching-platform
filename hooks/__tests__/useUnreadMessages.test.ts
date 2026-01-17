import { renderHook, act, waitFor } from '@testing-library/react';
import { useUnreadMessages } from '../useUnreadMessages';
import * as supabaseModule from '@/lib/supabase';
import * as messagingModule from '@/lib/messaging';

// Mock modules
jest.mock('@/lib/supabase');
jest.mock('@/lib/messaging');

describe('useUnreadMessages Hook', () => {
  const mockUserId = '12345678-1234-1234-1234-123456789012';
  const mockClientIds = [
    '87654321-4321-4321-4321-210987654321',
    'abcdefab-cdef-abcd-efab-cdefabcdefab',
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (messagingModule.getUnreadCount as jest.Mock).mockResolvedValue(5);

    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockClientIds.map((id) => ({ id })),
            error: null,
          }),
          single: jest.fn().mockResolvedValue({
            data: { id: mockClientIds[0] },
            error: null,
          }),
        }),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
      }),
      removeChannel: jest.fn(),
    };

    (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue(
      mockSupabaseClient
    );
  });

  describe('initial loading', () => {
    it('should load unread count on mount', async () => {
      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      await waitFor(() => {
        expect(messagingModule.getUnreadCount).toHaveBeenCalledWith(
          mockUserId,
          'coach'
        );
      });
    });

    it('should set unread count after loading', async () => {
      (messagingModule.getUnreadCount as jest.Mock).mockResolvedValue(3);

      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(3);
      });
    });

    it('should initialize with 0 unread count', () => {
      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      expect(result.current.unreadCount).toBe(0);
    });

    it('should handle empty userId', () => {
      const { result } = renderHook(() => useUnreadMessages('', 'coach'));

      expect(messagingModule.getUnreadCount).not.toHaveBeenCalled();
    });

    it('should handle load error', async () => {
      const errorMessage = 'Failed to load unread count';
      (messagingModule.getUnreadCount as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });
  });

  describe('coach role handling', () => {
    it('should get all client IDs for coaches', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockClientIds.map((id) => ({ id })),
              error: null,
            }),
          }),
        }),
        channel: jest.fn().mockReturnValue({
          on: jest.fn().mockReturnThis(),
          subscribe: jest.fn().mockReturnThis(),
        }),
        removeChannel: jest.fn(),
      };

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue(
        mockSupabaseClient
      );

      renderHook(() => useUnreadMessages(mockUserId, 'coach'));

      await waitFor(() => {
        // Should query clients table
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('clients');
      });
    });

    it('should setup filtered subscription for coaches', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockClientIds.map((id) => ({ id })),
              error: null,
            }),
          }),
        }),
        channel: jest.fn().mockReturnValue({
          on: jest.fn().mockReturnThis(),
          subscribe: jest.fn().mockReturnThis(),
        }),
        removeChannel: jest.fn(),
      };

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue(
        mockSupabaseClient
      );

      renderHook(() => useUnreadMessages(mockUserId, 'coach'));

      await waitFor(() => {
        // Channel should be created with coach-specific name
        expect(mockSupabaseClient.channel).toHaveBeenCalledWith(
          `messages-unread-${mockUserId}`
        );
      });
    });
  });

  describe('client role handling', () => {
    it('should get client record for clients', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ id: mockClientIds[0] }],
              error: null,
            }),
            single: jest.fn().mockResolvedValue({
              data: { id: mockClientIds[0] },
              error: null,
            }),
          }),
        }),
        channel: jest.fn().mockReturnValue({
          on: jest.fn().mockReturnThis(),
          subscribe: jest.fn().mockReturnThis(),
        }),
        removeChannel: jest.fn(),
      };

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue(
        mockSupabaseClient
      );

      renderHook(() => useUnreadMessages(mockUserId, 'client'));

      await waitFor(() => {
        // Should query clients table with user_id filter
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('clients');
      });
    });
  });

  describe('real-time subscriptions', () => {
    it('should initialize subscription as inactive', () => {
      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      expect(result.current.isSubscribed).toBe(false);
    });

    it('should update subscription status on channel subscribe', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockClientIds.map((id) => ({ id })),
              error: null,
            }),
          }),
        }),
        channel: jest.fn().mockReturnValue({
          on: jest.fn().mockReturnThis(),
          subscribe: jest.fn().mockImplementation((callback) => {
            callback('SUBSCRIBED');
          }),
        }),
        removeChannel: jest.fn(),
      };

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue(
        mockSupabaseClient
      );

      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(true);
      });
    });

    it('should handle channel errors', async () => {
      const mockSupabaseClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockClientIds.map((id) => ({ id })),
              error: null,
            }),
          }),
        }),
        channel: jest.fn().mockReturnValue({
          on: jest.fn().mockReturnThis(),
          subscribe: jest.fn().mockImplementation((callback) => {
            callback('CHANNEL_ERROR');
          }),
        }),
        removeChannel: jest.fn(),
      };

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue(
        mockSupabaseClient
      );

      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to subscribe to message updates');
        expect(result.current.isSubscribed).toBe(false);
      });
    });
  });

  describe('unread count updates', () => {
    it('should maintain unread count state', async () => {
      (messagingModule.getUnreadCount as jest.Mock)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(6);

      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(5);
      });

      // Initial count should be set
      expect(result.current.unreadCount).toBe(5);
    });
  });

  describe('error handling', () => {
    it('should handle initial load errors gracefully', async () => {
      (messagingModule.getUnreadCount as jest.Mock).mockRejectedValue(
        new Error('Query failed')
      );

      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      await waitFor(() => {
        // Hook should handle error without crashing
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('role parameter validation', () => {
    it('should accept coach role', async () => {
      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      await waitFor(() => {
        expect(messagingModule.getUnreadCount).toHaveBeenCalledWith(
          mockUserId,
          'coach'
        );
      });
    });

    it('should accept client role', async () => {
      const { result } = renderHook(() =>
        useUnreadMessages(mockUserId, 'client')
      );

      await waitFor(() => {
        expect(messagingModule.getUnreadCount).toHaveBeenCalledWith(
          mockUserId,
          'client'
        );
      });
    });
  });

  describe('cleanup', () => {
    it('should complete cleanup on unmount', async () => {
      const { unmount } = renderHook(() =>
        useUnreadMessages(mockUserId, 'coach')
      );

      await waitFor(() => {
        expect(messagingModule.getUnreadCount).toHaveBeenCalled();
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});
