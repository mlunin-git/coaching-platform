"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { paginate } from "@/lib/pagination";
import { PaginationControls } from "@/components/PaginationControls";
import type { Database } from "@/lib/database.types";

type Client = Database["public"]["Tables"]["clients"]["Row"];

interface ClientWithUser extends Client {
  email?: string | null;
  client_identifier?: string | null;
  has_auth_access?: boolean;
}

interface ClientsListProps {
  clients: ClientWithUser[];
  isLoading: boolean;
}

const PAGE_SIZE = 10;

export function ClientsList({ clients, isLoading }: ClientsListProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Paginate the clients
  const paginatedData = paginate(clients, currentPage, PAGE_SIZE);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("coach.clientsList")} ({paginatedData.totalItems})
        </h3>
      </div>

      {clients.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {t("coach.noClientsYet")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  {t("coach.name")}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  {t("coach.identifier")}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  {t("coach.loginAccess")}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  {t("coach.added")}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  {t("coach.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.items.map((client) => (
                <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{client.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="font-mono text-xs">
                      {client.email || client.client_identifier || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {client.has_auth_access ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t("coach.canLogin")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {t("coach.viewOnly")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => router.push(`/coach/clients/${client.id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t("coach.viewTasks")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paginatedData.totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-4">
          <PaginationControls
            currentPage={paginatedData.page}
            totalPages={paginatedData.totalPages}
            onPageChange={setCurrentPage}
            pageSize={PAGE_SIZE}
            totalItems={paginatedData.totalItems}
          />
        </div>
      )}
    </div>
  );
}
