import React from 'react';
import { StudentData } from '@/types';
import { Shield, Target, BookOpen, MessageSquare, BookOpenCheck, Headphones } from 'lucide-react';
import { useGeminiRecommendations } from '@/hooks/useGeminiRecommendations';
import { Skeleton } from "@/components/ui/skeleton";

interface ActionPlanProps {
  studentData: StudentData;
}

const SkillSection: React.FC<{
  skill: string;
  icon: React.ReactNode;
  data: {
    strengths: string[];
    weaknesses: string[];
    shortTermActions: string[];
    longTermStrategy: string[];
    resources: string[];
  };
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = ({ skill, icon, data, bgColor, textColor, borderColor }) => (
  <div className={`p-4 ${bgColor} rounded-lg`}>
    <div className={`flex items-center gap-2 pb-2 border-b ${borderColor}`}>
      {icon}
      <h4 className={`text-lg font-semibold ${textColor}`}>{skill}</h4>
    </div>
    
    {/* Strengths */}
    <div className="mt-3">
      <h5 className="font-medium mb-1">Strengths</h5>
      <ul className="list-disc pl-5 space-y-1">
        {data.strengths.map((item, idx) => (
          <li key={idx} className={textColor}>{item}</li>
        ))}
      </ul>
    </div>

    {/* Areas for Improvement */}
    <div className="mt-3">
      <h5 className="font-medium mb-1">Areas for Improvement</h5>
      <ul className="list-disc pl-5 space-y-1">
        {data.weaknesses.map((item, idx) => (
          <li key={idx} className={textColor}>{item}</li>
        ))}
      </ul>
    </div>

    {/* Actions */}
    <div className="mt-3">
      <h5 className="font-medium mb-1">Recommended Actions</h5>
      <ul className="list-disc pl-5 space-y-1">
        {data.shortTermActions.map((action, idx) => (
          <li key={idx} className={textColor}>{action}</li>
        ))}
      </ul>
    </div>
  </div>
);

const SkillSkeleton = () => (
  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
    <Skeleton className="h-6 w-32" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

const ActionPlan: React.FC<ActionPlanProps> = ({ studentData }) => {
  const { recommendations, isLoading, error } = useGeminiRecommendations(studentData);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkillSkeleton />
          <SkillSkeleton />
          <SkillSkeleton />
          <SkillSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error loading recommendations. Using default recommendations.
      </div>
    );
  }

  const skillConfigs = {
    READING: {
      icon: <BookOpenCheck className="h-5 w-5 text-emerald-600" />,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200"
    },
    LISTENING: {
      icon: <Headphones className="h-5 w-5 text-blue-600" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200"
    },
    SPEAKING: {
      icon: <MessageSquare className="h-5 w-5 text-purple-600" />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200"
    },
    WRITING: {
      icon: <BookOpen className="h-5 w-5 text-rose-600" />,
      bgColor: "bg-rose-50",
      textColor: "text-rose-700",
      borderColor: "border-rose-200"
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(recommendations).map(([skill, data]) => (
          <SkillSection
            key={skill}
            skill={skill}
            data={data}
            {...skillConfigs[skill as keyof typeof skillConfigs]}
          />
        ))}
      </div>

      {/* Long-term Strategy Section */}
      <div className="p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-indigo-600" />
          <h4 className="text-lg font-semibold text-indigo-800">Long-term Strategy</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(recommendations).map(([skill, data]) => (
            <div key={skill}>
              <h5 className="font-medium text-indigo-800 mb-2">{skill}</h5>
              <ul className="list-disc pl-5 space-y-1">
                {data.longTermStrategy.map((strategy, idx) => (
                  <li key={idx} className="text-indigo-700">{strategy}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Resources Section */}
      <div className="p-4 bg-sky-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-sky-600" />
          <h4 className="text-lg font-semibold text-sky-800">Recommended Resources</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(recommendations).map(([skill, data]) => (
            <div key={skill}>
              <h5 className="font-medium text-sky-800 mb-2">{skill}</h5>
              <ul className="list-disc pl-5 space-y-1">
                {data.resources.map((resource, idx) => (
                  <li key={idx} className="text-sky-700">{resource}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionPlan;