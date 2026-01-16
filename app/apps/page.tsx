"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WheelOfLife } from "@/components/apps/WheelOfLife";
import { SectorEditor } from "@/components/apps/SectorEditor";
import { EmotionMap } from "@/components/apps/EmotionMap";
import { GoalFormulationWizard } from "@/components/apps/GoalFormulationWizard";
import { Gallwey5StepSession } from "@/components/apps/Gallwey5StepSession";
import { SecondaryGainsAnalyzer } from "@/components/apps/SecondaryGainsAnalyzer";
import { LimitingBeliefsIdentifier } from "@/components/apps/LimitingBeliefsIdentifier";
import { EcologicalAssessmentChecklist } from "@/components/apps/EcologicalAssessmentChecklist";
import { LogicalLevelsFramework } from "@/components/apps/LogicalLevelsFramework";

interface Sector {
  id: string;
  name: string;
  level: number;
}

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function AppsPage() {
  const { t } = useLanguage();
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [totalLevel, setTotalLevel] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(0.5);
  const [selectedEmotionId, setSelectedEmotionId] = useState<string | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<string[]>([]);

  const apps: App[] = [
    {
      id: "wheel-of-life",
      name: t("apps.wheelOfLife"),
      description: t("apps.wheelOfLifeDescription"),
      icon: "🎡",
    },
    {
      id: "emotion-map",
      name: t("apps.emotionMap"),
      description: t("apps.emotionMapDescription"),
      icon: "🌈",
    },
    {
      id: "goal-wizard",
      name: t("apps.goalFormulationWizard"),
      description: t("apps.goalFormulationWizardDescription"),
      icon: "🏆",
    },
    {
      id: "gallwey-5step",
      name: t("apps.gallwey5Step"),
      description: t("apps.gallwey5StepDescription"),
      icon: "🔄",
    },
    {
      id: "secondary-gains",
      name: t("apps.secondaryGainsAnalyzer"),
      description: t("apps.secondaryGainsAnalyzerDescription"),
      icon: "⚖️",
    },
    {
      id: "limiting-beliefs",
      name: t("apps.limitingBeliefsIdentifier"),
      description: t("apps.limitingBeliefsIdentifierDescription"),
      icon: "🔗",
    },
    {
      id: "ecology",
      name: t("apps.ecologicalAssessmentChecklist"),
      description: t("apps.ecologicalAssessmentChecklistDescription"),
      icon: "🌿",
    },
    {
      id: "logical-levels",
      name: t("apps.logicalLevelsFramework"),
      description: t("apps.logicalLevelsFrameworkDescription"),
      icon: "📚",
    },
  ];

  // Wheel of Life handlers
  const handleAddSector = (name: string, level: number) => {
    const newSector: Sector = {
      id: Date.now().toString(),
      name,
      level,
    };
    setSectors([...sectors, newSector]);
    setShowForm(false);
  };

  const handleEditSector = (name: string, level: number) => {
    if (!editingSectorId) return;
    setSectors(
      sectors.map((sector) =>
        sector.id === editingSectorId ? { ...sector, name, level } : sector
      )
    );
    setEditingSectorId(null);
  };

  const handleDeleteSector = (id: string) => {
    setSectors(sectors.filter((sector) => sector.id !== id));
  };

  const handleFillDefaults = () => {
    const defaultSectorNames = [
      t("apps.defaultSectors.mental"),
      t("apps.defaultSectors.physical"),
      t("apps.defaultSectors.partner"),
      t("apps.defaultSectors.family"),
      t("apps.defaultSectors.leisure"),
      t("apps.defaultSectors.joy"),
      t("apps.defaultSectors.growth"),
      t("apps.defaultSectors.expression"),
      t("apps.defaultSectors.financial"),
      t("apps.defaultSectors.balance"),
    ];

    const newSectors: Sector[] = defaultSectorNames.map((name) => ({
      id: Date.now().toString() + Math.random(),
      name,
      level: 10,
    }));

    setSectors(newSectors);
  };

  const handleDownloadWheel = async () => {
    if (!wheelContainerRef.current || sectors.length === 0) return;

    try {
      // Dynamic import html2canvas only when needed (bundle optimization)
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(wheelContainerRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `wheel-of-life-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading wheel:", error);
      alert("Failed to download wheel image");
    }
  };

  // Update total level when sectors change
  const averageLevel = sectors.length > 0 ? (totalLevel / sectors.length).toFixed(1) : 0;
  const editingSector = sectors.find((s) => s.id === editingSectorId);

  // Update total level effect
  useEffect(() => {
    const total = sectors.reduce((sum, sector) => sum + sector.level, 0);
    setTotalLevel(total);
  }, [sectors]);

  // Handle emotion selection
  const handleSelectEmotion = (emotionId: string) => {
    setSelectedEmotionId(emotionId);
    setEmotionHistory([emotionId, ...emotionHistory.slice(0, 9)]);
  };

  if (selectedAppId === "emotion-map") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div>
            <button
              onClick={() => setSelectedAppId(null)}
              className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors"
            >
              ← {t("apps.backToApps")}
            </button>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t("apps.emotionMap")}</h2>
            <p className="text-gray-600">
              🔒 {t("apps.dataPrivacy")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Emotion Map Visualization */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <EmotionMap
                  selectedEmotionId={selectedEmotionId}
                  onSelectEmotion={handleSelectEmotion}
                />
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              {/* Selected Emotion */}
              {selectedEmotionId && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("apps.selectedEmotion")}
                  </h3>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 font-medium">
                      You are experiencing this emotion
                    </p>
                  </div>
                </div>
              )}

              {/* Emotion History */}
              {emotionHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("apps.emotionHistory")}
                  </h3>
                  <div className="space-y-2">
                    {emotionHistory.map((emotionId, index) => (
                      <button
                        key={`${emotionId}-${index}`}
                        onClick={() => handleSelectEmotion(emotionId)}
                        className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700 font-medium"
                      >
                        {index === 0 && "📍 "}
                        Emotion selection
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ About This Tool</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The Emotion Map helps you recognize and explore your feelings. Each emotional sphere contains emotions arranged by intensity. Understanding your emotions is the first step to managing them effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedAppId === "goal-wizard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setSelectedAppId(null)}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors block"
          >
            ← {t("apps.backToApps")}
          </button>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t("apps.goalFormulationWizard")}</h2>
            <p className="text-gray-600 mb-6">🔒 {t("apps.dataPrivacy")}</p>
            <GoalFormulationWizard />
          </div>
        </div>
      </div>
    );
  }

  if (selectedAppId === "gallwey-5step") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setSelectedAppId(null)}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors block"
          >
            ← {t("apps.backToApps")}
          </button>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t("apps.gallwey5Step")}</h2>
            <p className="text-gray-600 mb-6">🔒 {t("apps.dataPrivacy")}</p>
            <Gallwey5StepSession />
          </div>
        </div>
      </div>
    );
  }

  if (selectedAppId === "secondary-gains") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setSelectedAppId(null)}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors block"
          >
            ← {t("apps.backToApps")}
          </button>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t("apps.secondaryGainsAnalyzer")}</h2>
            <p className="text-gray-600 mb-6">🔒 {t("apps.dataPrivacy")}</p>
            <SecondaryGainsAnalyzer />
          </div>
        </div>
      </div>
    );
  }

  if (selectedAppId === "limiting-beliefs") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setSelectedAppId(null)}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors block"
          >
            ← {t("apps.backToApps")}
          </button>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t("apps.limitingBeliefsIdentifier")}</h2>
            <p className="text-gray-600 mb-6">🔒 {t("apps.dataPrivacy")}</p>
            <LimitingBeliefsIdentifier />
          </div>
        </div>
      </div>
    );
  }

  if (selectedAppId === "ecology") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setSelectedAppId(null)}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors block"
          >
            ← {t("apps.backToApps")}
          </button>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t("apps.ecologicalAssessmentChecklist")}</h2>
            <p className="text-gray-600 mb-6">🔒 {t("apps.dataPrivacy")}</p>
            <EcologicalAssessmentChecklist />
          </div>
        </div>
      </div>
    );
  }

  if (selectedAppId === "logical-levels") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setSelectedAppId(null)}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors block"
          >
            ← {t("apps.backToApps")}
          </button>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t("apps.logicalLevelsFramework")}</h2>
            <p className="text-gray-600 mb-6">🔒 {t("apps.dataPrivacy")}</p>
            <LogicalLevelsFramework />
          </div>
        </div>
      </div>
    );
  }

  if (selectedAppId === "wheel-of-life") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div>
            <button
              onClick={() => setSelectedAppId(null)}
              className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors"
            >
              ← {t("apps.backToApps")}
            </button>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t("apps.wheelOfLife")}</h2>
            <p className="text-gray-600">🔒 {t("apps.dataPrivacy")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wheel Visualization */}
            <div className="lg:col-span-2">
              <div ref={wheelContainerRef} className="bg-white rounded-xl shadow-lg p-6">
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
                <div className="flex justify-center">
                  <div
                    style={{
                      width: "fit-content",
                      animation: isSpinning ? `spin ${15 / spinSpeed}s linear infinite` : "none",
                    }}
                  >
                    <WheelOfLife sectors={sectors} size={450} />
                  </div>
                </div>

                {/* Statistics */}
                {sectors.length > 0 && (
                  <>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600">Average Satisfaction</p>
                        <p className="text-3xl font-bold text-blue-600">{averageLevel}</p>
                        <p className="text-xs text-gray-500">out of 10</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600">Total Sectors</p>
                        <p className="text-3xl font-bold text-blue-600">{sectors.length}</p>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={handleDownloadWheel}
                      className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      ⬇️ Download Wheel
                    </button>
                  </>
                )}

                {sectors.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>{t("apps.noSectors")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              {/* Fill Defaults Button - Always Visible */}
              <button
                onClick={handleFillDefaults}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all duration-300"
              >
                🎯 {t("apps.fillDefaults")}
              </button>

              {/* Sectors List */}
              {sectors.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("apps.sectors")}</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sectors.map((sector) => (
                      <div
                        key={sector.id}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{sector.name}</p>
                          <p className="text-sm text-gray-500">
                            {sector.level} {t("apps.outOf10")}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingSectorId(sector.id);
                              setShowForm(false);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteSector(sector.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add/Edit Form */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingSectorId ? t("apps.editSector") : t("apps.addSector")}
                </h3>

                {showForm || editingSectorId ? (
                  <SectorEditor
                    sector={editingSector}
                    onSave={editingSectorId ? handleEditSector : handleAddSector}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingSectorId(null);
                    }}
                    isEditing={!!editingSectorId}
                  />
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 font-medium transition-all duration-300"
                  >
                    + {t("apps.addSector")}
                  </button>
                )}
              </div>

              {/* Animation Controls */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎬 {t("apps.animationSpeed")}</h3>

                <div className="space-y-4">
                  {/* Speed Slider */}
                  <div>
                    <label htmlFor="speed-slider" className="block text-sm font-medium text-gray-700 mb-2">
                      {isSpinning ? `${spinSpeed.toFixed(1)}x` : t("apps.noAnimation")}
                    </label>
                    <input
                      id="speed-slider"
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={spinSpeed}
                      onChange={(e) => setSpinSpeed(parseFloat(e.target.value))}
                      disabled={!isSpinning}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  {/* Spin/Stop Button */}
                  <button
                    onClick={() => setIsSpinning(!isSpinning)}
                    className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                      isSpinning
                        ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
                    }`}
                  >
                    {isSpinning ? t("apps.stop") : t("apps.spin")} 🔄
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t("apps.title")}</h2>
            <p className="text-gray-600">{t("apps.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer flex flex-col hover:scale-[1.02]"
                onClick={() => setSelectedAppId(app.id)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 w-fit">{app.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6 flex-1">{app.description}</p>
                <button
                  onClick={() => setSelectedAppId(app.id)}
                  className="self-end px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 font-medium text-sm transition-all duration-300"
                >
                  {t("apps.launchApp")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
