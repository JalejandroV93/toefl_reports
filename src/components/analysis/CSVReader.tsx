// components/analysis/CSVReader.tsx
'use client';

import React, { useState, useCallback, useEffect } from "react";
import { parse, ParseResult } from "papaparse"; // Import ParseResult
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Copy, ExternalLink } from "lucide-react";
import { StudentData } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReportGenerationProgress from "@/components/reports/ReportGenerationProgress";
import { reportFactoryService } from "@/services/reportFactoryService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useProcessTime } from "@/hooks/useProcessTime";
import { z, ZodError } from "zod"; // Import Zod

interface CSVReaderProps {
  onDataLoaded: (data: StudentData[], group: string) => Promise<string>;
}

// Zod schema for student data validation
const studentDataSchema = z.object({
  Nombre: z.string().min(1, "Name is required"),
  "Apellido(s)": z.string().min(1, "Last name is required"),
  READING: z.number().min(0).max(100),
  LISTENING: z.number().min(0).max(100),
  SPEAKING: z.number().min(0).max(100),
  WRITING: z.number().min(0).max(100),
  "FEEDBACK SPEAKING": z.string().optional().default(""),
  "FEEDBACK WRITING": z.string().optional().default(""),
});


const CSVReader: React.FC<CSVReaderProps> = ({ onDataLoaded }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [progress, setProgress] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();  
  const [studentsCount, setStudentsCount] = useState(0);

  const { startProcessing, stopProcessing } = useProcessTime(studentsCount);

  useEffect(() => {
    const subscription = reportFactoryService.progressObservable.subscribe(
      (progressUpdate) => {
        setProgress(progressUpdate);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const extractGroupFromFilename = (filename: string): string | null => {
    const match = filename.match(/(\d+[A-Z]?)/i);
    return match ? match[1].toUpperCase() : null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      setError("No file selected.");
      return;
    }

    if (file.type !== "text/csv") {
      setError("Please upload a valid CSV file.");
      return;
    }

    const group = extractGroupFromFilename(file.name);
    if (!group) {
      setError("File name must include group number (e.g., toefl_10A.csv)");
      return;
    }

    setCsvFile(file);
    setError(null);
    setGeneratedUrl(null);
    setIsProcessing(false); // Reset processing state
    setProgress(null);
    // Pre-parsing validation using beforeFirstChunk
    parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      preview: 1, // Read only the first line for header check
      beforeFirstChunk: (chunk) => {
        const rows = chunk.split("\n");
        if (rows.length > 0) {
          const headers = rows[0].split(";"); // Split by semicolon
          const requiredColumns = [
            "Nombre",
            "Apellido(s)",
            "READING",
            "LISTENING",
            "SPEAKING",
            "WRITING",
          ];
          const missingColumns = requiredColumns.filter(
            (col) => !headers.includes(col)
          );

          if (missingColumns.length > 0) {
            // Immediately stop parsing and set the error
            setError(`Missing required columns: ${missingColumns.join(", ")}`);
            return; // Stop parsing
          }
        }
      },
      complete: () => {
        // After header check, now we can parse to get the count.  We still
        // do full validation later.
        parse(file, {
          header: true,
          skipEmptyLines: true,
          delimiter: ";",
          preview: 1000, // Limit for count
          complete: (results) => {
            setStudentsCount(results.data.length);
          },
          error: (err) => {
            setError(`Error reading file: ${err.message}`);
          },
        });
      },
      error: (err) => {
        setError(`Error during pre-parse: ${err.message}`);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: isProcessing,
  });

   const handleParse = async () => {
     if (!csvFile) {
       setError("No file selected");
       return;
     }

     const group = extractGroupFromFilename(csvFile.name);
     if (!group) {
       setError("Could not extract group from filename");
       return;
     }

     setIsProcessing(true);
     startProcessing();
     setError(null);

     try {
       const result = await new Promise<StudentData[]>((resolve, reject) => {
         parse(csvFile, {
           header: true,
           skipEmptyLines: true,
           delimiter: ";",
           dynamicTyping: true,
           complete: (results: ParseResult<StudentData>) => {
             // Type the results
             if (results.errors.length) {
               reject(
                 new Error(
                   `Error processing file: ${results.errors[0].message}`
                 )
               );
               return;
             }
             // Zod validation for each row
             const validatedData: StudentData[] = [];
             for (const row of results.data) {
               try {
                 const validatedRow = studentDataSchema.parse(row);
                 // If validation succeeds, add to the array
                 validatedData.push(validatedRow);
               } catch (error) {
                 if (error instanceof ZodError) {
                   // Construct a user-friendly error message
                   const errorMessages = error.errors
                     .map((e) => `${e.path.join(".")}: ${e.message}`)
                     .join("; ");
                   reject(
                     new Error(
                       `Validation error in row ${
                         results.data.indexOf(row) + 2
                       }: ${errorMessages}`
                     )
                   );
                   return; // Stop processing if any row is invalid
                 }
                 reject(error); //For other kind of errors.
                 return;
               }
             }
             resolve(validatedData);
           },
           error: (error) => {
             reject(new Error(`Error reading file: ${error.message}`));
           },
         });
       });

       const shareUrl = await onDataLoaded(result, group);
       setGeneratedUrl(shareUrl);

       toast({
         title: "Success",
         description: "Report generated successfully!",
       });
     } catch (err) {
       console.error("Error parsing CSV:", err);
       setError(err instanceof Error ? err.message : "Error processing file");

       toast({
         variant: "destructive",
         title: "Error",
         description:
           err instanceof Error ? err.message : "Error processing file",
       });
     } finally {
       setIsProcessing(false);
       stopProcessing();
     }
   };


  const handleCopyUrl = () => {
    if (generatedUrl) {
      const fullUrl = `${window.location.origin}${generatedUrl}`;
      navigator.clipboard.writeText(fullUrl);
      toast({
        title: "URL Copied",
        description: "Report URL has been copied to clipboard",
      });
    }
  };

  const handleViewReport = () => {
    if (generatedUrl) {
      router.push(generatedUrl);
    }
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
    setError(null);
    setProgress(null);
    setGeneratedUrl(null);
  };


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {progress && !generatedUrl ? (
          <ReportGenerationProgress progress={progress} />
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} disabled={isProcessing} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? 'Drop the CSV file here'
                : 'Drag and drop a CSV file here, or click to select'}
            </p>
          </div>
        )}

        {csvFile && !progress && !generatedUrl && (
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
              disabled={isProcessing}
            >
              Remove
            </Button>
          </div>
        )}

        {generatedUrl && (
          <div className="mt-4 space-y-4">
            <Alert>
              <AlertDescription>
                Report generated successfully! You can now view it or copy the URL.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button
                onClick={handleViewReport}
                className="flex-1"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Report
              </Button>
              <Button
                onClick={handleCopyUrl}
                variant="outline"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </Button>
            </div>
          </div>
        )}

        {!generatedUrl && (
          <Button
            onClick={handleParse}
            disabled={!csvFile || isProcessing}
            className="mt-4 w-full"
          >
            {isProcessing ? "Processing..." : "Generate Report"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CSVReader;
