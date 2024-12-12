
import React, { useMemo } from 'react';
import { StudentData } from '@/types';
import { getLevelForScore } from '@/utils/reportUtils';
import { Shield, Target, BookOpen, MessageSquare } from 'lucide-react';

interface ActionPlanProps {
  studentData: StudentData;
  recommendations: { [key: string]: string[] };
}

// Separar la lógica de negocio en un custom hook
const useActionPlanData = (studentData: StudentData, recommendations: { [key: string]: string[] }) => {
  return useMemo(() => {
    const skills = ['READING', 'LISTENING', 'SPEAKING', 'WRITING'] as const;
    
    // Encontrar la habilidad más baja
    const lowestSkill = skills.reduce((lowest, current) => {
      const currentScore = studentData[current];
      const lowestScore = studentData[lowest];
      return (currentScore < lowestScore) ? current : lowest;
    });

    // Generar metas basadas en los datos y recomendaciones
    const generateGoals = () => {
      const goals = [];
      
      // Agregar meta para la habilidad más baja
      goals.push(`Improve ${lowestSkill.toLowerCase()} score (currently at ${studentData[lowestSkill]})`);
      
      // Agregar recomendaciones específicas si existen
      if (recommendations['SPEAKING']?.length) {
        goals.push(...recommendations['SPEAKING'].slice(0, 2));
      }
      if (recommendations['WRITING']?.length) {
        goals.push(...recommendations['WRITING'].slice(0, 2));
      }

      // Asegurar que siempre haya al menos una meta
      if (goals.length === 0) {
        goals.push(`Focus on improving overall TOEFL performance`);
      }

      return goals;
    };

    // Generar actividades de práctica basadas en el nivel
    const generatePracticeActivities = (skill: string) => {
      const level = getLevelForScore(studentData[skill as keyof StudentData] as number);
      
      const defaultActivities = [
        'Regular practice with structured materials',
        'Work with language tutors',
        'Use online learning resources'
      ];

      const skillSpecificActivities = {
        SPEAKING: {
          B1: [
            'Daily conversation practice',
            'Record and analyze speech',
            'Join speaking clubs'
          ],
          B2: [
            'Academic discussions',
            'Presentation practice',
            'Debate techniques'
          ],
          C1: [
            'Advanced presentations',
            'Public speaking practice',
            'Academic seminars'
          ]
        },
        WRITING: {
          B1: [
            'Daily journal writing',
            'Basic essay practice',
            'Grammar exercises'
          ],
          B2: [
            'Academic essays',
            'Research writing',
            'Advanced grammar'
          ],
          C1: [
            'Research papers',
            'Academic publications',
            'Complex arguments'
          ]
        }
      };

      return skillSpecificActivities[skill as keyof typeof skillSpecificActivities]?.[level as keyof (typeof skillSpecificActivities)['SPEAKING']] 
        || defaultActivities;
    };

    // Generar recursos recomendados
    const generateResources = () => [
      'TOEFL Official Materials',
      'Academic Word Lists',
      'Practice Tests',
      'Language Exchange Partners',
      'Speaking and Writing Tools'
    ];

    return {
      goals: generateGoals(),
      speakingActivities: generatePracticeActivities('SPEAKING'),
      writingActivities: generatePracticeActivities('WRITING'),
      resources: generateResources()
    };
  }, [studentData, recommendations]);
};

const ActionPlan: React.FC<ActionPlanProps> = ({ studentData, recommendations }) => {
  const { goals, speakingActivities, writingActivities, resources } = useActionPlanData(studentData, recommendations);

  return (
    <div className="space-y-6">
      {/* Short-term Goals */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-blue-800">Short-term Goals</h3>
        </div>
        <ul className="list-disc pl-5 space-y-2">
          {goals.map((goal, index) => (
            <li key={index} className="text-blue-700">{goal}</li>
          ))}
        </ul>
      </div>

      {/* Practice Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speaking Practice */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 pb-2 border-b border-green-200">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <h4 className="text-lg font-semibold text-green-800">
              Speaking Practice
            </h4>
          </div>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            {speakingActivities.map((practice, index) => (
              <li key={index} className="text-green-700">{practice}</li>
            ))}
          </ul>
        </div>

        {/* Writing Practice */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <h4 className="text-lg font-semibold text-purple-800">
              Writing Practice
            </h4>
          </div>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            {writingActivities.map((practice, index) => (
              <li key={index} className="text-purple-700">{practice}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Resources */}
      <div className="p-4 bg-sky-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-sky-600" />
          <h4 className="text-lg font-semibold text-sky-800">Recommended Resources</h4>
        </div>
        <ul className="list-disc pl-5 space-y-2">
          {resources.map((resource, index) => (
            <li key={index} className="text-sky-700">{resource}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActionPlan;