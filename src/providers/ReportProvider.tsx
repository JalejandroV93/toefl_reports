'use client';

import React, { createContext, useContext, useState } from 'react';
import { StudentData } from '@/types';
import { reportService } from '@/services/reportService';
import { useToast } from "@/hooks/use-toast";

interface ReportContextType {
  studentsData: StudentData[];
  setStudentsData: (data: StudentData[]) => void;
  handleDataLoaded: (data: StudentData[], group: string) => Promise<string>;
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
  const { toast } = useToast();

  const handleDataLoaded = async (data: StudentData[], group: string): Promise<string> => {
    setLoading(true);
    try {
      if (!data || data.length === 0) {
        throw new Error('No student data provided');
      }

      if (!group) {
        throw new Error('No group specified');
      }

      setStudentsData(data);
      
      const result = await reportService.createReport({
        group,
        studentsData: data,
      });

      console.log('Report created:', result);

      toast({
        title: "Success",
        description: `Report for group ${group} has been generated successfully.`,
      });
      // Return the share URL for the report
      return `/shared/report/${(result as { shareToken: string }).shareToken}`;

    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
      });
      throw error;
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