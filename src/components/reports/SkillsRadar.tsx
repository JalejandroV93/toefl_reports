import React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SkillsRadarProps {
  data: {
    subject: string;
    score: number;
    fullMark: number;
  }[];
}

const SkillsRadar: React.FC<SkillsRadarProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#4B5563" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={6} />
          <Tooltip
            formatter={(value: number) => [`${value}/100`, "Score"]}
            contentStyle={{ backgroundColor: "white", borderRadius: "8px" }}
          />
          <Radar
            name="Skills"
            dataKey="score"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsRadar;
