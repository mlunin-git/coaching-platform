/**
 * Test setup and mock utilities for hooks
 */

interface SupabaseOptions {
  ascending?: boolean;
}

interface MockChannel {
  name: string;
  listeners: Array<{ event: string; config: unknown; callback: unknown }>;
  on: (event: string, config: unknown, callback: unknown) => MockChannel;
  subscribe: (callback?: (status: string) => void) => MockChannel;
}

// Mock for Supabase client
export const createMockSupabaseClient = () => {
  const channels: Record<string, MockChannel> = {};

  return {
    from: (table: string) => ({
      select: (fields: string) => ({
        eq: (field: string, value: unknown) => ({
          single: async () => ({ data: null, error: null }),
          order: (field: string, options: SupabaseOptions) => ({
            limit: (count: number) => ({
              data: [],
              error: null,
            }),
          }),
          not: (field: string, operator: string, value: unknown) => ({
            like: (field: string, pattern: string) => ({
              order: (field: string, options: SupabaseOptions) => ({
                limit: (count: number) => ({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    }),

    channel: (name: string): MockChannel => {
      if (!channels[name]) {
        channels[name] = {
          name,
          listeners: [],
          on: function(event: string, config: unknown, callback: unknown) {
            this.listeners.push({ event, config, callback });
            return this;
          },
          subscribe: function(callback?: (status: string) => void) {
            if (callback) callback('SUBSCRIBED');
            return this;
          },
        };
      }
      return channels[name];
    },

    removeChannel: (channel: MockChannel) => {
      if (channel && channel.name) {
        delete channels[channel.name];
      }
    },
  };
};

// Mock getMessages function
export const mockGetMessages = jest.fn(async (clientId: string) => {
  return [
    {
      id: '1',
      client_id: clientId,
      sender_type: 'coach',
      content: 'Hello client',
      read_by_client: true,
      read_by_coach: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      client_id: clientId,
      sender_type: 'client',
      content: 'Hello coach',
      read_by_client: true,
      read_by_coach: false,
      created_at: new Date().toISOString(),
    },
  ];
});

// Mock markMessagesAsRead function
export const mockMarkMessagesAsRead = jest.fn(async (clientId: string, userType: string) => {
  return;
});

// Mock getUnreadCount function
export const mockGetUnreadCount = jest.fn(async (userId: string, userRole: string) => {
  return userRole === 'coach' ? 5 : 2;
});
