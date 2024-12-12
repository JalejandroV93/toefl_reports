'use client';

import React, { useState, useCallback } from 'react';
import { parse } from 'papaparse';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from 'lucide-react';
import { StudentData } from '@/types';

interface CSVReaderProps {
  onDataLoaded: (data: StudentData[]) => void;
}

const CSVReader: React.FC<CSVReaderProps> = ({ onDataLoaded }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setError(null);
    } else {
      setError('Por favor sube un archivo CSV válido');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleParse = async () => {
    if (!csvFile) {
      setError('No se ha seleccionado ningún archivo');
      return;
    }

    parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length) {
          setError(`Error al procesar el archivo: ${results.errors[0].message}`);
          return;
        }

        onDataLoaded(results.data as StudentData[]);
      },
      error: (error) => {
        setError(`Error al leer el archivo: ${error.message}`);
      }
    });
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Suelta el archivo CSV aquí'
              : 'Arrastra y suelta un archivo CSV aquí, o haz clic para seleccionar'}
          </p>
        </div>

        {csvFile && (
          <div className="mt-4 flex items-center justify-between p-2 bg-gray-100 rounded">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">{csvFile.name}</span>
            </div>
            <Button
              onClick={handleRemoveFile}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
            >
              Eliminar
            </Button>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}

        <Button
          onClick={handleParse}
          disabled={!csvFile}
          className="mt-4 w-full"
        >
          Cargar Datos
        </Button>
      </CardContent>
    </Card>
  );
};

export default CSVReader;