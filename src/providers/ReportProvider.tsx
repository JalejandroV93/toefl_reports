// providers/ReportProvider.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentData } from '@/types';
import { reportService } from '@/services/reportService';
import { useToast } from "@/hooks/use-toast";
import { calculateLevelDistribution } from '@/utils/reportUtils';

interface ReportContextType {
  studentsData: StudentData[];
  setStudentsData: (data: StudentData[]) => void;
  handleDataLoaded: (data: StudentData[], group: string) => Promise<void>;
  loading: boolean;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDataLoaded = async (data: StudentData[], group: string) => {
    setLoading(true);
    try {
      // Validate data
      if (!data || data.length === 0) {
        throw new Error('No student data provided');
      }

      if (!group) {
        throw new Error('No group specified');
      }

      setStudentsData(data);
      
      // Calculate distribution data
      const distributionData = calculateLevelDistribution(data);

      // Initial recommendations
      const initialRecommendations = {
        shortTermActions: [
          "Review core skills",
          "Implement regular assessments",
          "Provide additional support"
        ],
        longTermStrategy: [
          "Develop curriculum alignment",
          "Create learning pathways",
          "Establish improvement framework"
        ]
      };
      
      const result = await reportService.createReport({
        group,
        studentsData: data,
        recommendations: initialRecommendations,
        distribution: distributionData
      });

      console.log('Report created:', result);

      toast({
        title: "Success",
        description: `Report for group ${group} has been saved.`,
      });

      router.push('/reports');
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    studentsData,
    setStudentsData,
    handleDataLoaded,
    loading
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
}