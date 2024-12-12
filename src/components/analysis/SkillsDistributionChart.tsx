import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartData {
  skill: string;
  C1: number;
  B2: number;
  B1: number;
  A2: number;
  Below: number;
}

interface SkillsDistributionChartProps {
  data: ChartData[];
}

const SkillsDistributionChart: React.FC<SkillsDistributionChartProps> = ({ data }) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="skill" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="C1" fill="#2563eb" name="C1 (80-100)" />
          <Bar dataKey="B2" fill="#16a34a" name="B2 (60-79)" />
          <Bar dataKey="B1" fill="#ca8a04" name="B1 (40-59)" />
          <Bar dataKey="A2" fill="#dc2626" name="A2 (0-39)" />
          <Bar dataKey="Below" fill="#881337" name="Below (0-39)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsDistributionChart;

