'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { FileQuestion } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-center px-4">
      <FileQuestion className="w-20 h-20 text-yellow-500 mb-8 animate-pulse" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        ¡Ups! Algo salió mal
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Página o Estudiante no encontrado
      </p>
      <Button 
        onClick={reset}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        Intentar de nuevo
      </Button>
    </div>
  )
}

