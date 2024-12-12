'use client';

import React, { createContext, useContext, useState } from 'react';
import { StudentData } from '@/types';
import { useRouter } from 'next/navigation';

interface ReportContextType {
  studentsData: StudentData[];
  setStudentsData: (data: StudentData[]) => void;
  handleDataLoaded: (data: StudentData[]) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const router = useRouter();

  const handleDataLoaded = (data: StudentData[]) => {
    setStudentsData(data);
    router.push('/reports');
  };

  const value = {
    studentsData,
    setStudentsData,
    handleDataLoaded
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