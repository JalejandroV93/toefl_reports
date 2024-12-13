import React from 'react';
import { StudentData } from '@/types';
import { Shield, Target, BookOpen, MessageSquare, Calendar } from 'lucide-react';
import { useGeminiRecommendations } from '@/hooks/useGeminiRecommendations';
import { useGeminiResources } from '@/hooks/useGeminiResources';
import { Skeleton } from "@/components/ui/skeleton";
import { getLevelForScore } from '@/utils/skillAnalysisUtils';

interface ActionPlanProps {
  studentData: StudentData;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  bgColor: string;
  textColor: string;
}

interface ListSectionProps {
  items: string[];
  textColor: string;
}

const Section: React.FC<SectionProps> = ({ 
  title, 
  icon, 
  children, 
  bgColor, 
  textColor 
}) => (
  <div className={`p-4 ${bgColor} rounded-lg`}>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h4 className={`text-lg font-semibold ${textColor}`}>{title}</h4>
    </div>
    {children}
  </div>
);

const ListSection: React.FC<ListSectionProps> = ({ 
  items, 
  textColor 
}) => (
  <ul className="list-disc pl-5 space-y-2">
    {items.map((item, idx) => (
      <li key={idx} className={textColor}>{item}</li>
    ))}
  </ul>
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

const determineTargetLevels = (studentData: StudentData): string[] => {
  const currentLevels = {
    READING: { score: studentData.READING, level: getLevelForScore(studentData.READING) },
    WRITING: { score: studentData.WRITING, level: getLevelForScore(studentData.WRITING) },
    SPEAKING: { score: studentData.SPEAKING, level: getLevelForScore(studentData.SPEAKING) },
    LISTENING: { score: studentData.LISTENING, level: getLevelForScore(studentData.LISTENING) }
  };

  const goals: string[] = [];

  Object.entries(currentLevels).forEach(([skill, data]) => {
    const { score, level } = data;
    
    const targetIncrement = 
      level === 'Below' ? 15 :
      level === 'A2' ? 12 :
      level === 'B1' ? 10 :
      level === 'B2' ? 8 : 5;

    const targetScore = Math.min(score + targetIncrement, 100);
    
    switch(skill) {
      case 'READING':
        goals.push(`Improve reading score from ${score} to ${targetScore} through intensive practice`);
        goals.push(`Master ${score < 50 ? 'basic' : 'advanced'} academic vocabulary (${Math.round(targetIncrement * 10)} words per month)`);
        break;
      case 'WRITING':
        goals.push(`Enhance writing organization and coherence to reach ${targetScore} points`);
        goals.push(`Complete ${score < 50 ? 2 : 3} practice essays per week with detailed feedback`);
        break;
      case 'SPEAKING':
        goals.push(`Improve speaking fluency to achieve ${targetScore} points`);
        goals.push(`Practice pronunciation and intonation ${score < 50 ? '30' : '45'} minutes daily`);
        break;
      case 'LISTENING':
        goals.push(`Enhance listening comprehension from ${score} to ${targetScore}`);
        goals.push(`Complete ${score < 50 ? '2' : '3'} academic lectures with note-taking weekly`);
        break;
    }
  });

  return goals;
};

const ActionPlan: React.FC<ActionPlanProps> = ({ studentData }) => {
  const { recommendations, isLoading: recLoading, error: recError } = useGeminiRecommendations(studentData);
  const { resources, isLoading: resLoading, error: resError } = useGeminiResources(studentData);

  if (recLoading || resLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <SkillSkeleton />
          <SkillSkeleton />
          <SkillSkeleton />
        </div>
      </div>
    );
  }

  const shortTermGoals = determineTargetLevels(studentData);

  return (
    <div className="space-y-6">
      {/* Short-term Goals Section */}
      <Section
        title="Short-term Goals"
        icon={<Calendar className="h-5 w-5 text-purple-600" />}
        bgColor="bg-purple-50"
        textColor="text-purple-700"
      >
        <ListSection
          items={shortTermGoals}
          textColor="text-purple-700"
        />
      </Section>

      {/* Practice Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Writing Practice */}
        <Section
          title="Writing Practice"
          icon={<BookOpen className="h-5 w-5 text-blue-600" />}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
        >
          <ListSection
            items={recommendations.WRITING?.shortTermActions || []}
            textColor="text-blue-700"
          />
        </Section>

        {/* Speaking Practice */}
        <Section
          title="Speaking Practice"
          icon={<MessageSquare className="h-5 w-5 text-emerald-600" />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-700"
        >
          <ListSection
            items={recommendations.SPEAKING?.shortTermActions || []}
            textColor="text-emerald-700"
          />
        </Section>
      </div>

      {/* Long-term Strategy */}
      <Section
        title="Long-term Strategy"
        icon={<Target className="h-5 w-5 text-indigo-600" />}
        bgColor="bg-indigo-50"
        textColor="text-indigo-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(recommendations).map(([skill, data]) => (
            <div key={skill}>
              <h5 className="font-medium text-indigo-800 mb-2">{skill}</h5>
              <ListSection
                items={data.longTermStrategy}
                textColor="text-indigo-700"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Resources Section */}
      <Section
        title="Recommended Resources"
        icon={<Shield className="h-5 w-5 text-sky-600" />}
        bgColor="bg-sky-50"
        textColor="text-sky-800"
      >
        {/* Dynamic resource categories from Gemini */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.categories.map((category, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
              <h5 className="font-medium text-sky-800 mb-2">{category.category}</h5>
              <p className="text-sky-600 text-sm mb-4">{category.description}</p>
              <div className="space-y-3">
                {category.resources.map((resource, resourceIdx) => (
                  <div key={resourceIdx} className="border-l-2 border-sky-200 pl-3">
                    <div className="flex items-start justify-between">
                      <h6 className="font-medium text-sky-900">{resource.name}</h6>
                      <span className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded">
                        {resource.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          Learn more →
                        </a>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {resource.focus.map((focus, focusIdx) => (
                          <span 
                            key={focusIdx}
                            className="text-xs px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {(resError || recError) && (
          <p className="mt-4 text-red-600 text-sm">
            Note: Some recommendations may be using default values due to an error.
          </p>
        )}
      </Section>
    </div>
  );
};

export default ActionPlan;