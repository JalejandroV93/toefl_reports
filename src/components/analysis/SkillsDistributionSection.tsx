import { ChartData } from '@/types';
import { BarChart2 } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SkillsDistributionSectionProps {
  distributionData: ChartData[];
}

const SkillsDistributionSection: React.FC<SkillsDistributionSectionProps> = ({ distributionData }) => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-semibold">Skills Distribution</h2>
      </div>
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