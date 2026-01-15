"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { validateAccessToken } from "@/lib/planning";

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const groupId = params.groupId as string;
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const valid = await validateAccessToken(groupId);
      setIsValid(valid);
      setLoading(false);
    };

    validateToken();
  }, [groupId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600">
            This planning group link is not valid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
