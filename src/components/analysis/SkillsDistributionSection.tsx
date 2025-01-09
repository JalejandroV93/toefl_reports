"use client";

import { ChartData } from "@/types";
import { BarChart2 } from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SkillsDistributionSectionProps {
  distributionData: ChartData[];
}

const SkillsDistributionSection: React.FC<SkillsDistributionSectionProps> = ({
  distributionData,
}) => {
  // Filter out Overall from the data
  const filteredData = distributionData.filter(
    (data) => data.skill !== "Overall"
  );

  //console.log("distributionData", distributionData);
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-semibold">Skills Distribution</h2>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="skill" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="C2" fill="#6569eb" name="C2 (114-120)" />
            <Bar dataKey="C1" fill="#2563eb" name="C1 (95-113)" />
            <Bar dataKey="B2" fill="#16a34a" name="B2 (72-94)" />
            <Bar dataKey="B1" fill="#ca8a04" name="B1 (42-71)" />
            <Bar dataKey="A2" fill="#dc2626" name="A2 (0-41)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default SkillsDistributionSection;
