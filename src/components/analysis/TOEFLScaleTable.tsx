import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const TOEFLScaleTable = () => {
  const levels = [
    { range: "24-30", score: "80-100", level: "Advanced (C1)", color: "blue", description: "Dominio avanzado del idioma. Comunicación fluida en contextos académicos y profesionales." },
    { range: "18-23", score: "60-79", level: "High Intermediate (B2)", color: "green", description: "Buen manejo del idioma. Puede comunicarse efectivamente en la mayoría de situaciones." },
    { range: "12-17", score: "40-59", level: "Low Intermediate (B1)", color: "yellow", description: "Manejo básico-intermedio. Puede comunicarse en situaciones cotidianas." },
    { range: "0-11", score: "0-39", level: "Basic (A2)", color: "red", description: "Nivel básico. Comunicación limitada a situaciones simples y cotidianas." },
  ];

  return (
    <Card className=" w-[900px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Conversión de Escalas TOEFL - 4 Niveles</CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Puntaje sobre 30</TableHead>
                <TableHead className="w-[100px]">Puntaje sobre 100</TableHead>
                <TableHead className="w-[150px]">Nivel</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels.map((level, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{level.range}</TableCell>
                  <TableCell>{level.score}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`bg-${level.color}-100 text-${level.color}-800 border-${level.color}-300`}>
                      {level.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{level.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Notas importantes:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Cada sección (Reading, Listening, Speaking, Writing) debe evaluarse independientemente</li>
            <li>Para alcanzar un nivel, se debe obtener el puntaje mínimo en todas las secciones</li>
            <li>El nivel final será el más bajo obtenido entre todas las secciones evaluadas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TOEFLScaleTable;

