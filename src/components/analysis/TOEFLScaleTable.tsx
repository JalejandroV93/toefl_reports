import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageCircle, Headphones, Edit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TOEFLScaleTable = () => {
  const levels = [
    { range: "24-30", score: "80-100", level: "Advanced (C1)", color: "blue", description: "Dominio avanzado del idioma. Comunicación fluida en contextos académicos y profesionales." },
    { range: "18-23", score: "60-79", level: "High Intermediate (B2)", color: "green", description: "Buen manejo del idioma. Puede comunicarse efectivamente en la mayoría de situaciones." },
    { range: "12-17", score: "40-59", level: "Low Intermediate (B1)", color: "yellow", description: "Manejo básico-intermedio. Puede comunicarse en situaciones cotidianas." },
    { range: "0-11", score: "0-39", level: "Basic (A2)", color: "red", description: "Nivel básico. Comunicación limitada a situaciones simples y cotidianas." },
  ];

  const skills = [
    { name: "Reading", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Listening", icon: <Headphones className="w-5 h-5" /> },
    { name: "Speaking", icon: <MessageCircle className="w-5 h-5" /> },
    { name: "Writing", icon: <Edit className="w-5 h-5" /> },
  ];

  return (
    <Card className="w-full max-w-4xl bg-gradient-to-br from-white-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-center">Conversión de Escalas TOEFL - 4 Niveles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-200 dark:bg-gray-900">
                <TableHead className="w-[100px] font-semibold">Puntaje sobre 30</TableHead>
                <TableHead className="w-[100px] font-semibold">Puntaje sobre 100</TableHead>
                <TableHead className="w-[150px] font-semibold">Nivel</TableHead>
                <TableHead className="font-semibold">Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels.map((level, index) => (
                <TableRow key={index} className="hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors">
                  <TableCell className="font-medium">{level.range}</TableCell>
                  <TableCell>{level.score}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`bg-${level.color}-100 text-${level.color}-800 border-${level.color}-300 dark:bg-${level.color}-900 dark:text-${level.color}-200 dark:border-${level.color}-700`}
                    >
                      {level.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{level.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">Notas importantes:</h3>
          <ul className="space-y-4">
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">1</span>
              <span>Cada sección debe evaluarse independientemente:</span>
            </li>
            <div className="flex justify-center space-x-8">
              {skills.map((skill, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
                          {skill.icon}
                        </div>
                        <span className="text-sm font-medium">{skill.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Evaluar {skill.name.toLowerCase()} independientemente</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">2</span>
              <span>Para alcanzar un nivel, se debe obtener el puntaje mínimo en todas las secciones</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">3</span>
              <span>El nivel final será el más bajo obtenido entre todas las secciones evaluadas</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TOEFLScaleTable;

