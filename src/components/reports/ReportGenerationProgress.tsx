// components/reports/ReportGenerationProgress.tsx
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { GenerationProgress } from '@/services/reportFactoryService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, BarChart } from "lucide-react";

interface ReportGenerationProgressProps {
  progress: GenerationProgress;
}

const ReportGenerationProgress: React.FC<ReportGenerationProgressProps> = ({ progress }) => {
  const getStageIcon = (stage: GenerationProgress['stage']) => {
    switch (stage) {
      case 'general':
        return <Brain className="w-5 h-5" />;
      case 'individual':
        return <Users className="w-5 h-5" />;
      case 'analysis':
        return <BarChart className="w-5 h-5" />;
    }
  };

  const getStageTitle = (stage: GenerationProgress['stage']) => {
    switch (stage) {
      case 'general':
        return 'Generating General Recommendations';
      case 'individual':
        return 'Generating Individual Reports';
      case 'analysis':
        return 'Analyzing Skills Distribution';
    }
  };

  const percentage = (progress.current / progress.total) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStageIcon(progress.stage)}
          {getStageTitle(progress.stage)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={percentage} />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Processing {progress.current} of {progress.total}</span>
            <span>
              Estimated wait: {Math.ceil(progress.estimatedWaitTime / 1000)}s
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerationProgress;