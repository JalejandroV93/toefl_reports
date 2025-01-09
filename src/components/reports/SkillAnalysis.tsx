import { SkillRecommendation } from "@/types/recommendations";
import { getLevelForScore } from '@/utils/scoreConversion';
import React from "react";
import { BookOpenCheck, Headphones, MessageSquare, BookOpen } from "lucide-react";

interface SkillAnalysisProps {
  skill: string;
  score: number;
  feedback?: string;
  recommendations?: SkillRecommendation;
}

const SkillAnalysis: React.FC<SkillAnalysisProps> = ({
  skill,
  score,
  feedback,
  recommendations,
}) => {
  const level = getLevelForScore(score, skill);

  const getSkillConfig = (skillName: string) => {
    const configs = {
      READING: {
        icon: <BookOpenCheck className="h-5 w-5 text-emerald-600" />,
        colors: {
          header: 'bg-emerald-50',
          iconColor: 'text-emerald-700',
          textColor: 'text-emerald-700',
          strengthsBg: 'bg-teal-50'
        }
      },
      LISTENING: {
        icon: <Headphones className="h-5 w-5 text-blue-600" />,
        colors: {
          header: 'bg-blue-50',
          iconColor: 'text-white',
          textColor: 'text-blue-700',
          strengthsBg: 'bg-blue-50'
        }
      },
      SPEAKING: {
        icon: <MessageSquare className="h-5 w-5 text-purple-600" />,
        colors: {
          header: 'bg-purple-50',
          iconColor: 'text-white',
          textColor: 'text-purple-700',
          strengthsBg: 'bg-purple-50'
        }
      },
      WRITING: {
        icon: <BookOpen className="h-5 w-5 text-rose-600" />,
        colors: {
          header: 'bg-rose-50',
          iconColor: 'text-white',
          textColor: 'text-rose-700',
          strengthsBg: 'bg-rose-50'
        }
      }
    };

    return configs[skillName as keyof typeof configs] || configs.READING;
  };

  const config = getSkillConfig(skill);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className={`p-4 ${config.colors.header} flex items-center gap-2`}>
        <div className={config.colors.iconColor}>{config.icon}</div>
        <h3 className={`text-xl font-semibold ${config.colors.textColor}`}>
          {skill} Analysis ({score} - {level})
        </h3>
      </div>

      <div className="p-4 bg-white space-y-4">
        {/* Strengths and Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations?.strengths && recommendations.strengths.length > 0 && (
            <div className={`p-4 ${config.colors.strengthsBg} rounded-lg`}>
              <h4 className="font-semibold text-gray-800 mb-2">Strengths:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {recommendations.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-700">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendations?.weaknesses && recommendations.weaknesses.length > 0 && (
            <div className={`p-4 ${config.colors.strengthsBg} rounded-lg`}>
              <h4 className="font-semibold text-gray-800 mb-2">
                Areas for Improvement:
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {recommendations.weaknesses.map((improvement, index) => (
                  <li key={index} className="text-gray-700">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className={`p-4 ${config.colors.strengthsBg} rounded-lg`}>
            <h4 className="font-semibold text-gray-800 mb-2">Feedback:</h4>
            <p className="text-gray-700">{feedback}</p>
          </div>
        )}

        {/* Recommended Actions */}
        {recommendations?.shortTermActions && recommendations.shortTermActions.length > 0 && (
          <div className={`p-4 ${config.colors.strengthsBg} rounded-lg`}>
            <h4 className="font-semibold text-gray-800 mb-2">
              Recommended Actions:
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.shortTermActions.map((action, index) => (
                <li key={index} className="text-gray-700">
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillAnalysis;