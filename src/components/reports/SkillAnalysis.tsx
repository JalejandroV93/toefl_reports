import React from 'react';
import { getLevelForScore } from '@/utils/reportUtils';

interface SkillAnalysisProps {
  skill: string;
  score: number;
  feedback?: string;
  recommendations?: string[];
}

const SkillAnalysis: React.FC<SkillAnalysisProps> = ({ 
  skill, 
  score, 
  feedback,
  recommendations 
}) => {
  const level = getLevelForScore(score);
  
  // Separar recomendaciones en fortalezas y áreas de mejora
  const strengths = recommendations?.filter(r => !r.toLowerCase().includes('mejorar') && !r.toLowerCase().includes('trabajar')) || [];
  const improvements = recommendations?.filter(r => r.toLowerCase().includes('mejorar') || r.toLowerCase().includes('trabajar')) || [];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">
        {skill} Analysis ({score} - {level})
      </h3>
      
      {strengths.length > 0 && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Strengths:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {strengths.map((strength, index) => (
              <li key={index} className="text-green-700">{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">Areas for Improvement:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {improvements.map((improvement, index) => (
              <li key={index} className="text-red-700">{improvement}</li>
            ))}
          </ul>
        </div>
      )}

      {feedback && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Feedback:</h4>
          <p className="text-blue-700">{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default SkillAnalysis;