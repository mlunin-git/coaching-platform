"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShareLinkProps {
  accessToken: string;
}

export function ShareLink({ accessToken }: ShareLinkProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/planning/${accessToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
      <p className="text-sm font-medium text-gray-700 mb-2">
        {t("planning.admin.shareLink")}
      </p>
      <div className="flex gap-3 items-center">
        <code className="flex-1 px-3 py-2 bg-white rounded border border-gray-300 text-xs text-gray-700 overflow-x-auto">
          {shareUrl}
        </code>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors font-medium text-sm whitespace-nowrap"
        >
          {copied ? "✓ " + t("planning.admin.copied") : t("planning.admin.copyLink")}
        </button>
      </div>
    </div>
  );
}
