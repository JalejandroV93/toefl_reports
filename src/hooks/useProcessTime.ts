// hooks/useProcessTime.ts
import { useState, useEffect } from 'react';

const AVERAGE_TIME_PER_STUDENT = 4000; // 4 segundos por estudiante
const GENERAL_ANALYSIS_TIME = 5000; // 5 segundos para análisis general

export const useProcessTime = (totalStudents: number) => {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isProcessing || totalStudents <= 0) return;

    const totalEstimatedTime = (totalStudents * AVERAGE_TIME_PER_STUDENT) + GENERAL_ANALYSIS_TIME;
    setRemainingTime(totalEstimatedTime);

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing, totalStudents]);

  const startProcessing = () => setIsProcessing(true);
  const stopProcessing = () => {
    setIsProcessing(false);
    setRemainingTime(0);
  };

  return {
    remainingTime,
    startProcessing,
    stopProcessing,
    isProcessing
  };
};