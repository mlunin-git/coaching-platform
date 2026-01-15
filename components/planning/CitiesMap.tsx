"use client";

interface City {
  city: string;
  country: string;
  count: number;
}

export function CitiesMap({ cities }: { cities: City[] }) {
  // Group cities by country
  const citiesByCountry = cities.reduce(
    (acc, city) => {
      if (!acc[city.country]) {
        acc[city.country] = [];
      }
      acc[city.country].push(city);
      return acc;
    },
    {} as Record<string, City[]>
  );

  const countries = Object.entries(citiesByCountry)
    .map(([country, cityList]) => ({
      name: country,
      cities: cityList,
      totalEvents: cityList.reduce((sum, c) => sum + c.count, 0),
    }))
    .sort((a, b) => b.totalEvents - a.totalEvents);

  return (
    <div>
      {cities.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p>No events with locations yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Create events with cities to see them appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {countries.map((country) => (
            <div key={country.name} className="border-l-4 border-indigo-600 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  🌍 {country.name}
                </h3>
                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm font-medium">
                  {country.totalEvents} {country.totalEvents === 1 ? "event" : "events"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {country.cities
                  .sort((a, b) => b.count - a.count)
                  .map((city) => (
                    <div
                      key={`${city.city}-${city.country}`}
                      className="bg-gray-50 rounded px-3 py-2 flex items-center justify-between"
                    >
                      <div className="text-sm text-gray-700">{city.city}</div>
                      <div className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-xs font-semibold">
                        {city.count}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {cities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {countries.length}
              </div>
              <div className="text-xs text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {cities.length}
              </div>
              <div className="text-xs text-gray-600">Cities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {cities.reduce((sum, c) => sum + c.count, 0)}
              </div>
              <div className="text-xs text-gray-600">Events</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
