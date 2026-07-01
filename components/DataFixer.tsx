"use client";

import { useState } from "react";
import { SalesData } from "@/lib/dataProcessor";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface DataFixerProps {
    rawData: SalesData[];
    onFixed: (fixedData: SalesData[]) => void;
}

export function DataFixer({ rawData, onFixed }: DataFixerProps) {
    const anomalousRows = rawData.filter(row => {
        const total = Number(row.Total) || Number(row.PVenta) || 0;
        const margen = Number(row.Margen) || Number(row.Ganancia) || 0;
        return total > 0 && Math.abs(total - margen) < 0.01;
    });

    const [fixes, setFixes] = useState<Record<string, number>>({});

    const handlePCompraChange = (id: string, pCompra: number) => {
        setFixes(prev => ({
            ...prev,
            [id]: pCompra
        }));
    };

    const applyFixes = () => {
        const newData = rawData.map(row => {
            if (row._id && fixes[row._id] !== undefined) {
                const total = Number(row.Total) || Number(row.PVenta) || 0;
                const pCompra = fixes[row._id];
                const newMargen = total - pCompra;
                return {
                    ...row,
                    Margen: newMargen
                };
            }
            return row;
        });
        onFixed(newData);
    };

    if (anomalousRows.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800">No hay datos anómalos</h3>
                <button 
                    onClick={() => onFixed(rawData)}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    Continuar al Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Datos Anómalos Detectados</h2>
                    <p className="text-gray-500">Se han encontrado {anomalousRows.length} fila(s) donde el Margen es igual al Total (probablemente falta el precio de compra).</p>
                </div>
            </div>

            <div className="overflow-x-auto mb-8 border border-gray-200 rounded-xl max-h-[60vh] custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Producto</th>
                            <th className="px-4 py-3">Vendedor</th>
                            <th className="px-4 py-3 text-right">Total Vendido</th>
                            <th className="px-4 py-3 text-center bg-indigo-50/90 border-l border-indigo-100 text-indigo-700 w-48">
                                Precio Compra (Ficticio)
                            </th>
                            <th className="px-4 py-3 text-right text-emerald-600">Nuevo Margen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {anomalousRows.map(row => {
                            const total = Number(row.Total) || Number(row.PVenta) || 0;
                            const currentPCompra = fixes[row._id || ''] || 0;
                            const newMargen = total - currentPCompra;

                            return (
                                <tr key={row._id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">{String(row["Fecha de la orden"] || row.Fecha).substring(0, 10)}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate" title={row["Variante del producto"] || row.Descripcion}>
                                        {row["Variante del producto"] || row.Descripcion}
                                    </td>
                                    <td className="px-4 py-3 truncate max-w-[120px]">{row.Vendedor || row.Usuario}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(total)}</td>
                                    <td className="px-4 py-3 bg-indigo-50/30 border-l border-indigo-50">
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-gray-400">S/</span>
                                            <input 
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={fixes[row._id || ''] === undefined ? '' : fixes[row._id || '']}
                                                onChange={(e) => handlePCompraChange(row._id || '', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                        {formatCurrency(newMargen)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-4">
                <button 
                    onClick={() => onFixed(rawData)}
                    className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
                >
                    Omitir y Continuar
                </button>
                <button 
                    onClick={applyFixes}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
                >
                    Aplicar y Generar Reporte
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
