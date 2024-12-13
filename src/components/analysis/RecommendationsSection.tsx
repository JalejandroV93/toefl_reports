import { Skeleton } from "@/components/ui/skeleton";
import { useGeminiGeneralRecommendations } from '@/hooks/useGeminiGeneralRecommendations';
import { ChartData } from '@/types';
import { LightbulbIcon } from 'lucide-react';
import React from 'react';

interface RecommendationsSectionProps {
  distributionData: ChartData[];
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  distributionData
}) => {
  const { recommendations, isLoading, error } = useGeminiGeneralRecommendations(distributionData);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <LightbulbIcon className="h-6 w-6 text-yellow-600" />
          <h2 className="text-2xl font-semibold">General Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <LightbulbIcon className="h-6 w-6 text-yellow-600" />
        <h2 className="text-2xl font-semibold">General Recommendations</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Short-term Actions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Short-term Actions</h3>
          <ul className="list-disc ml-4">
            {recommendations.shortTermActions.map((action, index) => (
              <li key={index} className="mb-2">{action}</li>
            ))}
          </ul>
        </div>

        {/* Long-term Strategy */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Long-term Strategy</h3>
          <ul className="list-disc ml-4">
            {recommendations.longTermStrategy.map((strategy, index) => (
              <li key={index} className="mb-2">{strategy}</li>
            ))}
          </ul>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-red-600 text-sm">
          Note: Using default recommendations due to error in generating custom ones.
        </p>
      )}
    </section>
  );
};

export default RecommendationsSection;