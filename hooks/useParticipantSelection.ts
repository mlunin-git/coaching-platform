/**
 * Hook for securely managing participant selection via HTTP-only cookies
 *
 * Replaces sessionStorage with secure server-side cookies.
 * Prevents XSS, session hijacking, and CSRF attacks.
 */

import { useEffect, useState, useCallback } from "react";
import {
  getParticipantCookie,
  setParticipantCookie,
  clearParticipantCookie,
} from "@/lib/cookies";
import { logger } from "@/lib/logger";

interface UseParticipantSelectionOptions {
  groupId: string;
  availableParticipants: Array<{ id: string; name: string }>;
  onSelectionChange?: (participantId: string | null) => void;
}

interface UseParticipantSelectionResult {
  selectedParticipantId: string | null;
  setSelectedParticipant: (participantId: string | null) => Promise<boolean>;
  clearSelection: () => Promise<boolean>;
  isLoading: boolean;
}

/**
 * Hook for securely managing participant selection
 *
 * Features:
 * - HTTP-only cookie storage (secure, not accessible from JavaScript)
 * - HTTPS-only transmission (Secure flag)
 * - CSRF protection (SameSite=Strict)
 * - Automatic 1-hour expiration
 * - Validation against available participants
 *
 * @param options - Configuration options
 * @returns Current selection state and setter functions
 *
 * @example
 * const {
 *   selectedParticipantId,
 *   setSelectedParticipant,
 *   isLoading,
 * } = useParticipantSelection({
 *   groupId: 'group-123',
 *   availableParticipants: participants,
 *   onSelectionChange: (id) => console.log('Selected:', id),
 * });
 *
 * // Set participant
 * await setSelectedParticipant('participant-456');
 *
 * // Clear selection
 * await clearSelection();
 */
export function useParticipantSelection({
  groupId,
  availableParticipants,
  onSelectionChange,
}: UseParticipantSelectionOptions): UseParticipantSelectionResult {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved participant selection from secure cookie on mount
  useEffect(() => {
    const loadSavedSelection = async () => {
      try {
        setIsLoading(true);
        const savedParticipantId = await getParticipantCookie(groupId);

        if (savedParticipantId && availableParticipants.length > 0) {
          // Validate that saved participant still exists
          const participantExists = availableParticipants.some(
            (p) => p.id === savedParticipantId
          );

          if (participantExists) {
            setSelectedParticipantId(savedParticipantId);
            onSelectionChange?.(savedParticipantId);
          } else {
            // Clear invalid/expired saved participant
            logger.debug("Saved participant no longer available, clearing", {
              groupId,
              savedParticipantId,
            });
            await clearParticipantCookie(groupId);
            setSelectedParticipantId(null);
          }
        }
      } catch (error) {
        logger.error("Failed to load saved participant selection", {
          groupId,
          error,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (availableParticipants.length > 0) {
      loadSavedSelection();
    }
  }, [groupId, availableParticipants, onSelectionChange]);

  /**
   * Set the selected participant and save to secure cookie
   *
   * @param participantId - The participant ID to select, or null to clear
   * @returns True if operation succeeded
   */
  const setSelectedParticipant = useCallback(
    async (participantId: string | null): Promise<boolean> => {
      try {
        if (!participantId) {
          const cleared = await clearParticipantCookie(groupId);
          if (cleared) {
            setSelectedParticipantId(null);
            onSelectionChange?.(null);
          }
          return cleared;
        }

        // Validate participant exists in available list
        const participantExists = availableParticipants.some(
          (p) => p.id === participantId
        );

        if (!participantExists) {
          logger.warn("Attempted to select non-existent participant", {
            groupId,
            participantId,
          });
          return false;
        }

        // Save to secure cookie
        const success = await setParticipantCookie(groupId, participantId);

        if (success) {
          setSelectedParticipantId(participantId);
          onSelectionChange?.(participantId);
        }

        return success;
      } catch (error) {
        logger.error("Failed to set participant selection", {
          groupId,
          participantId,
          error,
        });
        return false;
      }
    },
    [groupId, availableParticipants, onSelectionChange]
  );

  /**
   * Clear the participant selection
   *
   * @returns True if operation succeeded
   */
  const clearSelection = useCallback(async (): Promise<boolean> => {
    return setSelectedParticipant(null);
  }, [setSelectedParticipant]);

  return {
    selectedParticipantId,
    setSelectedParticipant,
    clearSelection,
    isLoading,
  };
}
