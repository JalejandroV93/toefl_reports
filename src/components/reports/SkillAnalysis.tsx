import { SkillRecommendation } from "@/types/recommendations";
import { getLevelForScore } from "@/utils/reportUtils";
import React from "react";

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
  const level = getLevelForScore(score);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">
        {skill} Analysis ({score} - {level})
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {recommendations?.strengths && recommendations.strengths.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Strengths:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.strengths.map((strength, index) => (
                <li key={index} className="text-green-700">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendations?.weaknesses &&
          recommendations.weaknesses.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">
                Areas for Improvement:
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {recommendations.weaknesses.map((improvement, index) => (
                  <li key={index} className="text-red-700">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>

      {feedback && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Feedback:</h4>
          <p className="text-blue-700">{feedback}</p>
        </div>
      )}

      {recommendations?.shortTermActions &&
        recommendations.shortTermActions.length > 0 && (
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">
              Recommended Actions:
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.shortTermActions.map((action, index) => (
                <li key={index} className="text-purple-700">
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
};

export default SkillAnalysis;
