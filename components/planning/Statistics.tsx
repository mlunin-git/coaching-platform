"use client";

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
}

export function Statistics({
  eventsCount,
  ideasCount,
  participantsCount,
}: {
  eventsCount: number;
  ideasCount: number;
  participantsCount: number;
}) {
  const stats: StatCard[] = [
    {
      title: "Events This Year",
      value: eventsCount,
      icon: "📅",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Ideas",
      value: ideasCount,
      icon: "💡",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Active Participants",
      value: participantsCount,
      icon: "👥",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={`${stat.bgColor} rounded-xl shadow-lg p-6 border-l-4 ${
            stat.color.replace("text-", "border-")
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${stat.color} mt-2`}>
                {stat.value}
              </p>
            </div>
            <div className="text-4xl opacity-20">{stat.icon}</div>
          </div>
        </div>
      ))}
    </>
  );
}
