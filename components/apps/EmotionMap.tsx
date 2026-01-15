"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface Emotion {
  id: string;
  name: string;
  intensity: number; // 1-3
}

interface EmotionalSphere {
  id: string;
  name: string;
  color: string;
  emotions: Emotion[];
}

interface EmotionMapProps {
  selectedEmotionId: string | null;
  onSelectEmotion: (emotionId: string) => void;
}

export function EmotionMap({ selectedEmotionId, onSelectEmotion }: EmotionMapProps) {
  const { t } = useLanguage();

  const emotionalSpheres: EmotionalSphere[] = [
    {
      id: "satisfaction",
      name: t("apps.emotionSpheres.satisfaction"),
      color: "#FFD700",
      emotions: [
        { id: "sat-1", name: t("apps.emotions.contentment"), intensity: 1 },
        { id: "sat-2", name: t("apps.emotions.joy"), intensity: 2 },
        { id: "sat-3", name: t("apps.emotions.delight"), intensity: 3 },
      ],
    },
    {
      id: "enthusiasm",
      name: t("apps.emotionSpheres.enthusiasm"),
      color: "#FF8C00",
      emotions: [
        { id: "ent-1", name: t("apps.emotions.interest"), intensity: 1 },
        { id: "ent-2", name: t("apps.emotions.enthusiasm"), intensity: 2 },
        { id: "ent-3", name: t("apps.emotions.excitement"), intensity: 3 },
      ],
    },
    {
      id: "tranquility",
      name: t("apps.emotionSpheres.tranquility"),
      color: "#87CEEB",
      emotions: [
        { id: "tra-1", name: t("apps.emotions.peacefulness"), intensity: 1 },
        { id: "tra-2", name: t("apps.emotions.calm"), intensity: 2 },
        { id: "tra-3", name: t("apps.emotions.contentment"), intensity: 3 },
      ],
    },
    {
      id: "surprise",
      name: t("apps.emotionSpheres.surprise"),
      color: "#FF1493",
      emotions: [
        { id: "sur-1", name: t("apps.emotions.surprise"), intensity: 1 },
        { id: "sur-2", name: t("apps.emotions.amazement"), intensity: 2 },
        { id: "sur-3", name: t("apps.emotions.astonishment"), intensity: 3 },
      ],
    },
    {
      id: "fear",
      name: t("apps.emotionSpheres.fear"),
      color: "#8B008B",
      emotions: [
        { id: "fea-1", name: t("apps.emotions.unease"), intensity: 1 },
        { id: "fea-2", name: t("apps.emotions.anxiety"), intensity: 2 },
        { id: "fea-3", name: t("apps.emotions.fear"), intensity: 3 },
      ],
    },
    {
      id: "antagonism",
      name: t("apps.emotionSpheres.antagonism"),
      color: "#DC143C",
      emotions: [
        { id: "ant-1", name: t("apps.emotions.annoyance"), intensity: 1 },
        { id: "ant-2", name: t("apps.emotions.anger"), intensity: 2 },
        { id: "ant-3", name: t("apps.emotions.rage"), intensity: 3 },
      ],
    },
    {
      id: "acceptance",
      name: t("apps.emotionSpheres.acceptance"),
      color: "#FF69B4",
      emotions: [
        { id: "acc-1", name: t("apps.emotions.trust"), intensity: 1 },
        { id: "acc-2", name: t("apps.emotions.acceptance"), intensity: 2 },
        { id: "acc-3", name: t("apps.emotions.love"), intensity: 3 },
      ],
    },
    {
      id: "distraction",
      name: t("apps.emotionSpheres.distraction"),
      color: "#9370DB",
      emotions: [
        { id: "dis-1", name: t("apps.emotions.distraction"), intensity: 1 },
        { id: "dis-2", name: t("apps.emotions.pensiveness"), intensity: 2 },
        { id: "dis-3", name: t("apps.emotions.contemplation"), intensity: 3 },
      ],
    },
    {
      id: "grieving",
      name: t("apps.emotionSpheres.grieving"),
      color: "#4B0082",
      emotions: [
        { id: "gri-1", name: t("apps.emotions.sadness"), intensity: 1 },
        { id: "gri-2", name: t("apps.emotions.sorrow"), intensity: 2 },
        { id: "gri-3", name: t("apps.emotions.grief"), intensity: 3 },
      ],
    },
    {
      id: "powerlessness",
      name: t("apps.emotionSpheres.powerlessness"),
      color: "#FF6347",
      emotions: [
        { id: "pow-1", name: t("apps.emotions.shame"), intensity: 1 },
        { id: "pow-2", name: t("apps.emotions.embarrassment"), intensity: 2 },
        { id: "pow-3", name: t("apps.emotions.humiliation"), intensity: 3 },
      ],
    },
    {
      id: "insignificance",
      name: t("apps.emotionSpheres.insignificance"),
      color: "#A9A9A9",
      emotions: [
        { id: "ins-1", name: t("apps.emotions.insecurity"), intensity: 1 },
        { id: "ins-2", name: t("apps.emotions.inadequacy"), intensity: 2 },
        { id: "ins-3", name: t("apps.emotions.inferiority"), intensity: 3 },
      ],
    },
    {
      id: "discomfort",
      name: t("apps.emotionSpheres.discomfort"),
      color: "#FF4500",
      emotions: [
        { id: "dis-1", name: t("apps.emotions.irritation"), intensity: 1 },
        { id: "dis-2", name: t("apps.emotions.frustration"), intensity: 2 },
        { id: "dis-3", name: t("apps.emotions.discomfort"), intensity: 3 },
      ],
    },
  ];

  const size = 500;
  const center = size / 2;
  const innerRadius = 80;
  const outerRadius = 200;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Concentric circles for reference */}
      <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      <circle cx={center} cy={center} r={(innerRadius + outerRadius) / 2} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#e5e7eb" strokeWidth="1" />

      {/* Emotional spheres and emotions */}
      {emotionalSpheres.map((sphere, sphereIndex) => {
        const angle = (sphereIndex * 360) / emotionalSpheres.length;
        const sphereCenterRadius = (innerRadius + outerRadius) / 2;
        const sphereCenterX = center + sphereCenterRadius * Math.cos((angle - 90) * (Math.PI / 180));
        const sphereCenterY = center + sphereCenterRadius * Math.sin((angle - 90) * (Math.PI / 180));

        return (
          <g key={sphere.id}>
            {/* Sphere label */}
            <text
              x={sphereCenterX}
              y={sphereCenterY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-semibold fill-gray-800 pointer-events-none"
            >
              {sphere.name.split(" ")[0]}
            </text>

            {/* Emotions in this sphere */}
            {sphere.emotions.map((emotion, emotionIndex) => {
              const emotionAngle = angle + (emotionIndex - 1) * 8;
              const emotionRadius =
                innerRadius + ((outerRadius - innerRadius) * emotion.intensity) / 3;
              const emotionX =
                center + emotionRadius * Math.cos((emotionAngle - 90) * (Math.PI / 180));
              const emotionY =
                center + emotionRadius * Math.sin((emotionAngle - 90) * (Math.PI / 180));

              const isSelected = selectedEmotionId === emotion.id;

              return (
                <g key={emotion.id}>
                  <circle
                    cx={emotionX}
                    cy={emotionY}
                    r={isSelected ? 12 : 8}
                    fill={sphere.color}
                    stroke={isSelected ? "#000" : "none"}
                    strokeWidth={isSelected ? 2 : 0}
                    className="cursor-pointer transition-all hover:r-10"
                    onClick={() => onSelectEmotion(emotion.id)}
                    style={{
                      opacity: isSelected ? 1 : 0.7,
                    }}
                  />
                  {isSelected && (
                    <text
                      x={emotionX}
                      y={emotionY + 25}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-900 pointer-events-none"
                    >
                      {emotion.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Center circle */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius - 5}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth="2"
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm font-semibold fill-gray-700 pointer-events-none"
      >
        {t("apps.emotionMap")}
      </text>
    </svg>
  );
}
