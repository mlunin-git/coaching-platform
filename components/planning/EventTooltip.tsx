"use client";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  city: string;
  creator: { name: string; color: string };
}

export function EventTooltip({ event }: { event: Event }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr.split("T")[0]);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white rounded-lg shadow-lg p-3 text-sm z-50 pointer-events-none">
      <h4 className="font-bold mb-1 line-clamp-2">{event.title}</h4>

      {event.description && (
        <p className="text-gray-300 text-xs mb-2 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="space-y-1 text-xs text-gray-300">
        <div>
          <span className="font-medium">📅</span> {formatDate(event.start_date)}
          {event.end_date && event.end_date !== event.start_date && (
            <> - {formatDate(event.end_date)}</>
          )}
        </div>

        {event.location && (
          <div>
            <span className="font-medium">📍</span> {event.location}
            {event.city && <>, {event.city}</>}
          </div>
        )}

        <div>
          <span className="font-medium">👤</span> {event.creator.name}
        </div>
      </div>
    </div>
  );
}
