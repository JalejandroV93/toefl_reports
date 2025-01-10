import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getLevelForScore } from "@/utils/scoreConversion";
import {
  BookOpen,
  BookOpenCheck,
  Headphones,
  MessageSquare,
} from "lucide-react";

interface SkillScoreCardProps {
  skill: string;
  score: number;
}

const SkillScoreCard: React.FC<SkillScoreCardProps> = ({ skill, score }) => {
  const level = getLevelForScore(score, skill);

  const getSkillIcon = () => {
    switch (skill.toLowerCase()) {
      case "reading":
        return <BookOpen className="w-16 h-16 text-blue-600 print:hidden" />;
      case "writing":
        return <BookOpenCheck className="w-16 h-16 text-blue-600 mb-2 print:hidden" />;
      case "listening":
        return <Headphones className="w-16 h-16 text-blue-600 mb-2 print:hidden" />;
      case "speaking":
        return <MessageSquare className="w-16 h-16 text-blue-600 mb-2 print:hidden" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 m-0">{skill}</h3>
            <div className="text-4xl font-bold text-blue-600 my-2">{score}</div>
            <div className="text-sm text-gray-600">Level {level}</div>
          </div>
          {getSkillIcon()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillScoreCard;
