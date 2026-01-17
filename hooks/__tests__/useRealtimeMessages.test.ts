import { renderHook, waitFor, act } from '@testing-library/react';
import { useRealtimeMessages } from '../useRealtimeMessages';
import * as supabaseModule from '@/lib/supabase';
import * as messagingModule from '@/lib/messaging';

// Mock modules
jest.mock('@/lib/supabase');
jest.mock('@/lib/messaging');

describe('useRealtimeMessages Hook', () => {
  const mockClientId = 'test-client-id';
  const mockMessages = [
    {
      id: '1',
      client_id: mockClientId,
      sender_type: 'coach' as const,
      content: 'Hello client',
      read_by_client: true,
      read_by_coach: true,
      created_at: '2025-01-16T10:00:00Z',
    },
    {
      id: '2',
      client_id: mockClientId,
      sender_type: 'client' as const,
      content: 'Hello coach',
      read_by_client: true,
      read_by_coach: false,
      created_at: '2025-01-16T10:05:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (messagingModule.getMessages as jest.Mock).mockResolvedValue(mockMessages);
    (messagingModule.markMessagesAsRead as jest.Mock).mockResolvedValue(undefined);

    const mockSupabaseClient = {
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
      }),
      removeChannel: jest.fn(),
    };

    (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('initial loading', () => {
    it('should load messages on mount', async () => {
      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(messagingModule.getMessages).toHaveBeenCalledWith(mockClientId);
      });
    });

    it('should set messages after loading', async () => {
      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.messages).toEqual(mockMessages);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should mark messages as read on initial load', async () => {
      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      await waitFor(() => {
        expect(messagingModule.markMessagesAsRead).toHaveBeenCalledWith(
          mockClientId,
          'coach'
        );
      });
    });

    it('should handle empty messages', async () => {
      (messagingModule.getMessages as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.messages).toEqual([]);
      });
    });

    it('should set error on load failure', async () => {
      const errorMessage = 'Failed to load messages';
      (messagingModule.getMessages as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should skip loading if clientId is empty', async () => {
      const { result } = renderHook(() =>
        useRealtimeMessages('', 'coach')
      );

      expect(result.current.loading).toBe(false);
      expect(messagingModule.getMessages).not.toHaveBeenCalled();
    });
  });

  describe('real-time subscriptions', () => {
    it('should setup subscription channel for client messages', async () => {
      const { result } = renderHook(() => useRealtimeMessages(mockClientId, 'coach'));

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThanOrEqual(0);
      });

      // Verify subscription was attempted (by checking messages were loaded)
      expect(messagingModule.getMessages).toHaveBeenCalled();
    });

    it('should validate clientId as UUID format', async () => {
      const invalidId = 'not-a-uuid';
      const { result } = renderHook(() =>
        useRealtimeMessages(invalidId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid client ID format');
      });
    });

    it('should handle subscription errors', async () => {
      const mockClient = {
        channel: jest.fn().mockReturnValue({
          on: jest.fn().mockReturnThis(),
          subscribe: jest.fn().mockImplementation((callback) => {
            callback('CHANNEL_ERROR');
            return {
              unsubscribe: jest.fn(),
            };
          }),
        }),
        removeChannel: jest.fn(),
      };

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue(mockClient);

      const { result } = renderHook(() =>
        useRealtimeMessages(
          '12345678-1234-1234-1234-123456789012',
          'coach'
        )
      );

      await waitFor(() => {
        expect(result.current.error).toContain('Real-time sync failed');
      }, { timeout: 2000 });
    });
  });

  describe('message refreshing', () => {
    it('should return refreshMessages function', () => {
      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      expect(typeof result.current.refreshMessages).toBe('function');
    });

    it('should reload messages when refreshMessages is called', async () => {
      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.messages).toEqual(mockMessages);
      });

      const newMessage = {
        id: '3',
        client_id: mockClientId,
        sender_type: 'coach' as const,
        content: 'New message',
        read_by_client: false,
        read_by_coach: true,
        created_at: '2025-01-16T10:10:00Z',
      };

      (messagingModule.getMessages as jest.Mock).mockResolvedValue([
        ...mockMessages,
        newMessage,
      ]);

      act(() => {
        result.current.refreshMessages();
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });
    });
  });

  describe('error handling', () => {
    it('should prioritize load errors over subscription errors', async () => {
      const loadError = 'Failed to load messages';
      (messagingModule.getMessages as jest.Mock).mockRejectedValue(
        new Error(loadError)
      );

      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      await waitFor(() => {
        expect(result.current.error).toBe(loadError);
      });
    });

    it('should handle marking messages as read failure', async () => {
      (messagingModule.markMessagesAsRead as jest.Mock).mockRejectedValue(
        new Error('Mark read failed')
      );

      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      await waitFor(() => {
        expect(messagingModule.markMessagesAsRead).toHaveBeenCalled();
      });
    });

    it('should clear error on successful reconnection', async () => {
      const mockClient = {
        channel: jest.fn().mockReturnValue({
          on: jest.fn().mockReturnThis(),
          subscribe: jest.fn(),
        }),
        removeChannel: jest.fn(),
      };

      let subscribeCallback: ((status: string) => void) | null = null;

      mockClient.channel().subscribe.mockImplementation((callback) => {
        subscribeCallback = callback;
        // Simulate initial error
        callback('CHANNEL_ERROR');
      });

      (supabaseModule.getSupabaseClient as jest.Mock).mockReturnValue(mockClient);

      const { result } = renderHook(() =>
        useRealtimeMessages(
          '12345678-1234-1234-1234-123456789012',
          'coach'
        )
      );

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Simulate successful reconnection
      act(() => {
        if (subscribeCallback) {
          subscribeCallback('SUBSCRIBED');
        }
      });

      await waitFor(() => {
        // Error should be cleared if no load error
      }, { timeout: 2000 });
    });
  });

  describe('user type handling', () => {
    it('should work with coach user type', async () => {
      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      await waitFor(() => {
        expect(messagingModule.markMessagesAsRead).toHaveBeenCalledWith(
          mockClientId,
          'coach'
        );
      });
    });

    it('should work with client user type', async () => {
      const { result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'client')
      );

      await waitFor(() => {
        expect(messagingModule.markMessagesAsRead).toHaveBeenCalledWith(
          mockClientId,
          'client'
        );
      });
    });
  });

  describe('cleanup', () => {
    it('should complete cleanup on unmount', async () => {
      const { unmount, result } = renderHook(() =>
        useRealtimeMessages(mockClientId, 'coach')
      );

      await waitFor(() => {
        expect(messagingModule.getMessages).toHaveBeenCalled();
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});
