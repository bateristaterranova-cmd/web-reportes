"use client";

import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Dashboard } from "@/components/Dashboard";
import { AlertCircle, BarChart3 } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const { processExcelFile } = await import("@/lib/dataProcessor"); // Lazy import to keep JS bundle optimal
      const result = await processExcelFile(file);
      setData(result);
    } catch (err) {
      setError("Hubo un problema al procesar el archivo. Asegúrate de que tenga las columnas correctas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Dashboard de Ventas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sube tu archivo de ventas (Excel o CSV) para generar automáticamente un reporte visual detallado.
          </p>
        </div>

        <FileUpload onUpload={handleUpload} isProcessing={loading} />

        {error && (
          <div className="max-w-xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Dashboard data={data} />
          </div>
        )}
      </div>
    </div>
  );
}
