// components/reports/ReportGenerationProgress.tsx
import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { GenerationProgress } from "@/services/reportFactoryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, BarChart } from "lucide-react";
import { geminiRateLimiter } from "@/services/geminiRateLimiter";

interface ReportGenerationProgressProps {
  progress: GenerationProgress;
}

const ReportGenerationProgress: React.FC<ReportGenerationProgressProps> = ({
  progress,
}) => {
  const [queueInfo, setQueueInfo] = useState({
    position: 0,
    estimatedWait: 0,
  });

  // Función para formatear el tiempo en minutos y segundos
  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.ceil((milliseconds % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Calculamos el tiempo estimado total basado en el número de estudiantes
  const calculateTotalEstimatedTime = () => {
    const remainingStudents = progress.total - progress.current;
    // Cada estudiante requiere aproximadamente 3 peticiones (general, individual, análisis)
    const remainingRequests = remainingStudents * 3;
    return geminiRateLimiter.getEstimatedTimeForRequests(remainingRequests);
  };

  useEffect(() => {
    const calculateTime = () => {
      const remainingStudents = progress.total - progress.current;
      const remainingRequests = remainingStudents * 3;
      return geminiRateLimiter.getEstimatedTimeForRequests(remainingRequests);
    };

    geminiRateLimiter.setQueueUpdateCallback((queueLength, estimatedWait) => {
      const queueTime = estimatedWait;
      const processingTime = calculateTime();

      setQueueInfo({
        position: queueLength,
        estimatedWait: queueTime + processingTime,
      });
    });

    return () => {
      geminiRateLimiter.setQueueUpdateCallback(null);
    };
  }, [progress.total, progress]);

  const getStageIcon = (stage: GenerationProgress["stage"]) => {
    switch (stage) {
      case "general":
        return <Brain className="w-5 h-5" />;
      case "individual":
        return <Users className="w-5 h-5" />;
      case "analysis":
        return <BarChart className="w-5 h-5" />;
    }
  };

  const getStageTitle = (stage: GenerationProgress["stage"]) => {
    switch (stage) {
      case "general":
        return "Generating General Recommendations";
      case "individual":
        return "Generating Individual Reports";
      case "analysis":
        return "Analyzing Skills Distribution";
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
            <span>
              Processing {progress.current} of {progress.total}
            </span>
            <span>
              Processing time: {formatTime(calculateTotalEstimatedTime())}
            </span>
          </div>
          {queueInfo.position > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Position in queue: {queueInfo.position}</span>
              <span className="hidden">Queue wait: {formatTime(queueInfo.estimatedWait)}</span>
            </div>
          )}
          <div className="text-sm text-gray-500 text-right">
            <span>
              Total estimated time:{" "}
              {formatTime(
                calculateTotalEstimatedTime() + queueInfo.estimatedWait
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerationProgress;
