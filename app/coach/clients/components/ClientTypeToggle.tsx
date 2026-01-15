import { useLanguage } from "@/contexts/LanguageContext";

interface ClientTypeToggleProps {
  useEmail: boolean;
  onChange: (useEmail: boolean) => void;
}

export function ClientTypeToggle({ useEmail, onChange }: ClientTypeToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={useEmail}
          onChange={() => onChange(true)}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm font-medium text-gray-700">
          {t("coach.withEmail")}
        </span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={!useEmail}
          onChange={() => onChange(false)}
          className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm font-medium text-gray-700">
          {t("coach.withoutEmail")}
        </span>
      </label>
    </div>
  );
}
