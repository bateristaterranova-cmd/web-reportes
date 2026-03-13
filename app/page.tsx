"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Dashboard } from "@/components/Dashboard";
import { AlertCircle, BarChart3, Clock, ChevronRight, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/reportes');
      if (res.ok) {
        const histData = await res.json();
        setHistory(histData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const { processExcelFile } = await import("@/lib/dataProcessor");
      const result = await processExcelFile(file);
      setData(result);
    } catch (err) {
      setError("Hubo un problema al procesar el archivo. Asegúrate de que tenga las columnas correctas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = (report: any) => {
    try {
      const parsedData = typeof report.detallesExtra === 'string' 
        ? JSON.parse(report.detallesExtra) 
        : report.detallesExtra;
      setData(parsedData);
      setShowHistory(false);
    } catch (e) {
      alert("No se pudo cargar el reporte");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="flex-grow flex py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className={`flex-grow transition-all duration-300 ${showHistory ? 'lg:w-3/4' : 'w-full'}`}>
            <div className="text-center mb-12 relative">
              <div className="absolute top-0 right-0 lg:hidden">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-3 bg-white rounded-xl shadow border flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Clock className="w-4 h-4" /> Historial
                </button>
              </div>
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                Dashboard de Ventas
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Sube tu archivo de ventas o revisa reportes anteriores guardados.
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
                <Dashboard data={data} onSaveSuccess={fetchHistory} />
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className={`
            ${showHistory ? 'block' : 'hidden lg:block'} 
            w-full lg:w-1/4 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 overflow-y-auto max-h-[85vh] sticky top-8
          `}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-gray-800">Historial</h2>
            </div>
            
            {loadingHistory ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No hay reportes guardados aún.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {history.map((rep) => (
                  <button 
                    key={rep.id} 
                    onClick={() => loadReport(rep)}
                    className="text-left w-full bg-slate-50 hover:bg-indigo-50 border hover:border-indigo-200 p-4 rounded-xl transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800">Rep: {rep.mes}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>G. Neta: <span className="font-medium text-emerald-600">{formatCurrency(rep.gananciaNeta)}</span></p>
                      <p>Ingresos: {formatCurrency(rep.ingresosTotales)}</p>
                      <p className="text-[10px] uppercase tracking-wide mt-2 pt-2 border-t text-slate-400">
                        Guardado: {new Date(rep.fecha).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
