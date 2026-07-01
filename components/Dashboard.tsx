"use client";

import { useRef, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    ComposedChart,
    Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";
import { Download, Save } from "lucide-react";

interface DashboardProps {
    data: {
        daily: { name: string; revenue: number; profit: number }[];
        monthly: { name: string; revenue: number; profit: number }[];
        topProducts: { name: string; value: number }[];
        sellers: { name: string; value: number }[];
        kpi: {
            totalProfit: number;
            avgUtility: number;
        }
    };
    onSaveSuccess?: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function Dashboard({ data, onSaveSuccess }: DashboardProps) {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [timeView, setTimeView] = useState<'daily' | 'monthly'>('daily');
    const [isSaving, setIsSaving] = useState(false);

    const downloadPDF = async () => {
        if (!dashboardRef.current) return;

        try {
            const dataUrl = await toPng(dashboardRef.current, { cacheBust: true, pixelRatio: 2 });
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const pdfBlob = pdf.output('blob');
            const blobUrl = URL.createObjectURL(pdfBlob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `Reporte_Ventas_${timeView === 'daily' ? 'Diario' : 'Mensual'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (err) {
            console.error("Error generating PDF", err);
        }
    };

    const totalRevenue = data.monthly.reduce((acc, curr) => acc + curr.revenue, 0);
    const grossProfit = data.kpi.totalProfit;

    const activeData = timeView === 'daily' ? data.daily : data.monthly;

    const saveReport = async () => {
        setIsSaving(true);
        try {
            const reportData = {
                mes: data.monthly[0]?.name || "Desconocido",
                anio: parseInt(data.monthly[0]?.name?.split('-')[0]) || new Date().getFullYear(),
                ingresosTotales: totalRevenue,
                gastosOperativos: 0,
                gananciaNeta: grossProfit,
                detallesExtra: data
            };

            const response = await fetch('/api/reportes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
            });

            if (response.ok) {
                if (onSaveSuccess) onSaveSuccess();
                alert("Reporte guardado exitosamente");
            } else {
                alert("Error al guardar reporte");
            }
        } catch (e) {
            console.error(e);
            alert("Error al guardar reporte");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                {/* Time View Selector */}
                <div className="flex bg-gray-100 p-1 rounded-xl border">
                    <button
                        onClick={() => setTimeView('daily')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            timeView === 'daily'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Vista Diaria
                    </button>
                    <button
                        onClick={() => setTimeView('monthly')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            timeView === 'monthly'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Vista Mensual
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={saveReport}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Guardando..." : "Guardar Reporte"}
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Descargar PDF
                    </button>
                </div>
            </div>

            <div ref={dashboardRef} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-12">
                <header className="mb-8 border-b pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Resumen Ejecutivo</h2>
                        <p className="text-gray-500 mt-2">
                            Análisis detallado de ventas, ganancias y rendimiento ({timeView === 'daily' ? 'Por día' : 'Por mes'}).
                        </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 self-start sm:self-auto">
                        {timeView === 'daily' ? 'Diario' : 'Mensual'}
                    </span>
                </header>

                {/* KPI Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Ganancia Total (Margen)</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(grossProfit)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-amber-600 uppercase tracking-wide">Utilidad Promed.</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{data.kpi.avgUtility.toFixed(2)}%</p>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Revenue vs Profit (Scrollable) */}
                    <div className="col-span-1 lg:col-span-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">
                            Ingresos vs Ganancias ({timeView === 'daily' ? 'Histórico Diario' : 'Histórico Mensual'})
                        </h3>
                        <div className="overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                            <div style={{ minWidth: `${Math.max(1000, activeData.length * (timeView === 'daily' ? 40 : 80))}px`, height: "450px" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={activeData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                                        <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            tickFormatter={(val) => `S/ ${val}`}
                                            tick={{ fontSize: 11 }}
                                            width={80}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : "0"}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Bar dataKey="revenue" name="Ingresos (PVenta)" barSize={timeView === 'daily' ? 15 : 30} fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                        <Line type="monotone" dataKey="profit" name="Ganancia (Margen)" stroke="#10b981" strokeWidth={3} dot={{ r: timeView === 'daily' ? 1.5 : 3 }} activeDot={{ r: 5 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Sales Trend (Scrollable) */}
                    <div className="col-span-1 lg:col-span-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">
                            Tendencia de Ventas ({timeView === 'daily' ? 'Diaria' : 'Mensual'})
                        </h3>
                        <div className="overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                            <div style={{ minWidth: `${Math.max(1000, activeData.length * (timeView === 'daily' ? 40 : 80))}px`, height: "400px" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={activeData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `S/ ${value}`}
                                            width={80}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : "0"}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#6366f1"
                                            strokeWidth={4}
                                            dot={{ r: timeView === 'daily' ? 1.5 : 4 }}
                                            activeDot={{ r: 8 }}
                                            name="Ventas Totales"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Top 10 Products by MARGIN */}
                    <div className="h-[650px] bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Top 10 Productos Estrella</h3>
                        <p className="text-xs text-gray-500 mb-6">Ordenados por Ganancia Total Generada (Margen acumulado)</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data.topProducts}
                                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={(val) => `S/ ${val}`} tick={{ fontSize: 11 }} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={220}
                                    tick={({ x, y, payload }) => (
                                        <g transform={`translate(${x},${y})`}>
                                            <text x={-10} y={0} dy={4} textAnchor="end" fill="#4B5563" fontSize={11} fontWeight={500}>
                                                {payload.value.length > 25 ? `${payload.value.substring(0, 25)}...` : payload.value}
                                            </text>
                                        </g>
                                    )}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : "0"}
                                    labelFormatter={(label) => `Producto: ${label}`}
                                />
                                <Legend />
                                <Bar dataKey="value" name="Ganancia Total (Margen)" fill="#10b981" radius={[0, 6, 6, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Sales by Seller */}
                    <div className="h-[650px] bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Rendimiento por Vendedor</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data.sellers}
                                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={(val) => `S/ ${val}`} tick={{ fontSize: 11 }} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={150}
                                    tick={{ fontSize: 12, fill: '#4B5563' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : "0"}
                                />
                                <Legend />
                                <Bar dataKey="value" name="Ventas por Vendedor" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={25}>
                                    {data.sellers.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
