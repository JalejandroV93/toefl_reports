import React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
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
  const maxScore = Math.max(...data.map((item) => item.fullMark));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="80%"
          startAngle={90}
          endAngle={-270}
          data={data}
        >
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#4B5563", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}/${maxScore}`, "Score"]}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "8px",
              border: "1px solid #e2e8f0",
            }}
          />
          <Radar
            name="Skills"
            dataKey="score"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.2}
            dot
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsRadar;
