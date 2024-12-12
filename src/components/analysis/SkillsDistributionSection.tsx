import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartData } from '@/types';

interface SkillsDistributionSectionProps {
  distributionData: ChartData[];
}

const SkillsDistributionSection: React.FC<SkillsDistributionSectionProps> = ({ distributionData }) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Skills Distribution</h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distributionData}>
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
    </section>
  );
};

export default SkillsDistributionSection;