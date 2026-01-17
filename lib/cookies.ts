"use server";

/**
 * Server-side cookie utilities for secure HTTP-only cookie management
 *
 * These server actions handle cookie operations securely, preventing:
 * - XSS attacks (cookies are HTTP-only, not accessible from JavaScript)
 * - Session hijacking (Secure flag ensures HTTPS-only transmission)
 * - CSRF attacks (SameSite=Strict prevents cross-site cookie access)
 */

import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

/**
 * Set a secure HTTP-only cookie for planning participant selection
 *
 * @param groupId - The planning group ID
 * @param participantId - The selected participant ID
 * @returns Success status
 *
 * @example
 * await setParticipantCookie('group-123', 'participant-456');
 */
export async function setParticipantCookie(
  groupId: string,
  participantId: string
): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookieName = `planning_participant_${groupId}`;

    // Validate inputs to prevent injection
    if (!groupId || !participantId) {
      return false;
    }

    // Set secure HTTP-only cookie
    cookieStore.set(cookieName, participantId, {
      httpOnly: true, // Cannot access from JavaScript (prevents XSS)
      secure: true, // HTTPS only
      sameSite: "strict", // Strict CSRF protection
      maxAge: 3600, // 1 hour expiration
      path: "/", // Available site-wide
    });

    return true;
  } catch (error) {
    logger.error("[SECURITY] Failed to set participant cookie:", error);
    return false;
  }
}

/**
 * Get a secure HTTP-only cookie for planning participant selection
 *
 * @param groupId - The planning group ID
 * @returns The participant ID or null if not found/expired
 *
 * @example
 * const participantId = await getParticipantCookie('group-123');
 */
export async function getParticipantCookie(
  groupId: string
): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookieName = `planning_participant_${groupId}`;

    const cookie = cookieStore.get(cookieName);
    return cookie?.value || null;
  } catch (error) {
    logger.error("[SECURITY] Failed to get participant cookie:", error);
    return null;
  }
}

/**
 * Clear a secure HTTP-only cookie for planning participant selection
 *
 * @param groupId - The planning group ID
 * @returns Success status
 *
 * @example
 * await clearParticipantCookie('group-123');
 */
export async function clearParticipantCookie(groupId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookieName = `planning_participant_${groupId}`;

    cookieStore.delete(cookieName);
    return true;
  } catch (error) {
    logger.error("[SECURITY] Failed to clear participant cookie:", error);
    return false;
  }
}

/**
 * Validate that a participant cookie exists and is valid
 *
 * @param groupId - The planning group ID
 * @param expectedParticipantId - The participant ID to validate
 * @returns True if cookie exists and matches expected value
 *
 * @example
 * const isValid = await validateParticipantCookie('group-123', 'participant-456');
 */
export async function validateParticipantCookie(
  groupId: string,
  expectedParticipantId: string
): Promise<boolean> {
  try {
    const participantId = await getParticipantCookie(groupId);
    return participantId === expectedParticipantId;
  } catch (error) {
    logger.error("[SECURITY] Failed to validate participant cookie:", error);
    return false;
  }
}
