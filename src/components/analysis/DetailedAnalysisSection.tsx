import React from 'react';
import { ChartData } from '@/types';
import { BookOpenCheck, Headphones, MessageSquare, BookOpen } from "lucide-react";
import { useGeminiSkillAnalysis } from '@/hooks/useGeminiSkillAnalysis';
import { Skeleton } from "@/components/ui/skeleton";
import { SkillsAnalysis } from "@/hooks/useGeminiSkillAnalysis";

interface DetailedAnalysisSectionProps {
  distributionData: ChartData[];
  analysis?: SkillsAnalysis;
}

const SkillSkeleton = () => (
  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

const DetailedAnalysisSection: React.FC<DetailedAnalysisSectionProps> = ({ 
  distributionData 
}) => {
  const { analysis, isLoading, error } = useGeminiSkillAnalysis(distributionData);
  
  // Filter out the "Overall" entry and only process individual skills
  const skillsData = distributionData.filter(data => data.skill !== 'Overall');

  const getSkillConfig = (skill: string) => {
    const configs = {
      Reading: {
        icon: <BookOpen className="h-5 w-5 text-blue-600" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      Listening: {
        icon: <Headphones className="h-5 w-5 text-green-600" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      Speaking: {
        icon: <MessageSquare className="h-5 w-5 text-purple-600" />,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      Writing: {
        icon: <BookOpenCheck className="h-5 w-5 text-rose-600" />,
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200'
      }
    };

    return configs[skill as keyof typeof configs] || configs.Reading;
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Detailed Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkillSkeleton />
          <SkillSkeleton />
          <SkillSkeleton />
          <SkillSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Detailed Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillsData.map((skillData) => {
          const skillAnalysis = analysis[skillData.skill];
          const config = getSkillConfig(skillData.skill);
          const averageScore = skillData.average || 0;

          return (
            <div 
              key={skillData.skill} 
              className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-3">
                {config.icon}
                <h3 className="font-medium text-lg">{skillData.skill}</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Performance Overview</p>
                  <p className="text-sm">Average Score: {averageScore.toFixed(1)}</p>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <p className="text-green-700">C2: {skillData.C2}</p>
                      <p className="text-green-700">C1: {skillData.C1}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">B2: {skillData.B2}</p>
                      <p className="text-yellow-700">B1: {skillData.B1}</p>
                    </div>
                    <div>
                      <p className="text-orange-700">A2: {skillData.A2}</p>
                    </div>
                   
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="font-medium text-green-700">Key Strengths:</p>
                    <ul className="list-disc ml-4 text-sm">
                      {skillAnalysis?.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-red-700">Areas for Improvement:</p>
                    <ul className="list-disc ml-4 text-sm">
                      {skillAnalysis?.improvements.map((improvement, idx) => (
                        <li key={idx}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">
          Note: Using default analysis due to error in generating custom analysis.
        </p>
      )}
    </section>
  );
};

export default DetailedAnalysisSection;