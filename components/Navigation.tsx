"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { NavigationMenuItems } from "./NavigationMenuItems";
import { LanguageSelector } from "./LanguageSelector";
import { NavigationUserSection } from "./NavigationUserSection";
import { logger } from "@/lib/logger";

interface User {
  id: string;
  email: string | null;
  name: string;
  role: "coach" | "client";
  auth_user_id: string | null;
  client_identifier: string | null;
  has_auth_access: boolean;
  created_at: string;
}

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          // Fetch user details
          const { data } = await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", authUser.id)
            .single();

          if (data) {
            setUser(data);
          }
        }
      } catch (error) {
        logger.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo / Branding */}
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 hover:text-gray-800 transition-colors"
          >
            Safe Space
          </Link>

          {/* Desktop Menu - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <NavigationMenuItems user={user} isMobile={false} />
            <LanguageSelector />
            <NavigationUserSection
              user={user}
              isMobile={false}
              onLogout={handleLogout}
            />
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Slide-out Drawer */}
              <div
                id="mobile-menu"
                className="fixed top-0 right-0 bottom-0 w-80 max-w-[80vw] bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-menu-title"
              >
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <span id="mobile-menu-title" className="text-lg font-bold text-gray-900">
                    Safe Space
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                    aria-label="Close navigation menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="flex flex-col p-4 space-y-2">
                  <NavigationMenuItems
                    user={user}
                    isMobile={true}
                    onLinkClick={() => setMobileMenuOpen(false)}
                  />

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-2" />

                  {/* Language Selector */}
                  <LanguageSelector className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer" />

                  {/* User Profile / Login */}
                  <NavigationUserSection
                    user={user}
                    isMobile={true}
                    onLogout={handleLogout}
                    onLinkClick={() => setMobileMenuOpen(false)}
                  />
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
