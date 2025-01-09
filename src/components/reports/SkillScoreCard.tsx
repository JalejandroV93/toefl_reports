import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { getLevelForScore } from '@/utils/scoreConversion';

interface SkillScoreCardProps {
  skill: string;
  score: number;
}

const SkillScoreCard: React.FC<SkillScoreCardProps> = ({ skill, score }) => {
  const level = getLevelForScore(score, skill);
  
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 m-0">{skill}</h3>
        <div className="text-4xl font-bold text-blue-600 my-2">{score}</div>
        <div className="text-sm text-gray-600">Level {level}</div>
      </CardContent>
    </Card>
  );
};

export default SkillScoreCard;