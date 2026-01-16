"use client";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "completed";
  completed_at: string | null;
  created_at: string;
  clientTaskId: string;
}

interface TaskCardProps {
  task: Task;
  onToggleStatus: () => void;
}

export function TaskCard({ task, onToggleStatus }: TaskCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 transition-all ${
        task.status === "completed" ? "bg-green-50 border-l-4 border-green-500" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={onToggleStatus}
          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            task.status === "completed"
              ? "bg-green-500 border-green-500"
              : "border-gray-300 hover:border-gray-400"
          }`}
          aria-label={task.status === "completed" ? "Mark as pending" : "Mark as complete"}
        >
          {task.status === "completed" && (
            <span className="text-white text-sm">✓</span>
          )}
        </button>

        <div className="flex-1">
          <h4
            className={`font-semibold ${
              task.status === "completed"
                ? "text-gray-500 line-through"
                : "text-gray-900"
            }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-gray-500">
              Created {new Date(task.created_at).toLocaleDateString()}
            </span>
            {task.completed_at && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Completed {new Date(task.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
