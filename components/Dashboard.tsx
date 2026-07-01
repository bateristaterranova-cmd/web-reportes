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
    LabelList,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";
import { Download, Save, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { SalesData } from "@/lib/dataProcessor";

interface DashboardProps {
    data: {
        daily: { name: string; revenue: number; profit: number }[];
        monthly: { name: string; revenue: number; profit: number }[];
        topProducts: { name: string; value: number }[];
        sellers: { name: string; value: number }[];
        kpi: {
            totalProfit: number;
            avgUtility: number;
            totalRevenue?: number;
            totalOrders?: number;
            averageTicket?: number;
            startDate?: string;
            endDate?: string;
        };
        rawData?: SalesData[];
    };
    onSaveSuccess?: () => void;
}

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

// Premium Custom Label Renderers with white background pills to prevent overlays and ensure 100% readability
const renderBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === undefined || value === null) return null;
    const valStr = `S/ ${Math.round(Number(value)).toLocaleString('es-PE')}`;
    const badgeWidth = Math.max(52, valStr.length * 6.2);
    const centerX = x + width / 2;
    return (
        <g>
            <rect 
                x={centerX - badgeWidth / 2} 
                y={y - 20} 
                width={badgeWidth} 
                height={14} 
                fill="#ffffff" 
                stroke="#4f46e5" 
                strokeWidth={1} 
                rx={4} 
            />
            <text 
                x={centerX} 
                y={y - 10} 
                fill="#312e81" 
                fontSize={8} 
                fontWeight="bold" 
                textAnchor="middle"
            >
                {valStr}
            </text>
        </g>
    );
};

const renderLineLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === undefined || value === null) return null;
    const valStr = `S/ ${Math.round(Number(value)).toLocaleString('es-PE')}`;
    const badgeWidth = Math.max(52, valStr.length * 6.2);
    return (
        <g>
            <rect 
                x={x - badgeWidth / 2} 
                y={y - 20} 
                width={badgeWidth} 
                height={14} 
                fill="#ffffff" 
                stroke="#10b981" 
                strokeWidth={1} 
                rx={4} 
            />
            <text 
                x={x} 
                y={y - 10} 
                fill="#047857" 
                fontSize={8} 
                fontWeight="bold" 
                textAnchor="middle"
            >
                {valStr}
            </text>
        </g>
    );
};

const renderHorizontalBarLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value === undefined || value === null) return null;
    const valStr = `S/ ${Math.round(Number(value)).toLocaleString('es-PE')}`;
    const badgeWidth = Math.max(52, valStr.length * 6.2);
    const labelY = y + height / 2;
    return (
        <g>
            <rect 
                x={x + 6} 
                y={labelY - 7} 
                width={badgeWidth} 
                height={14} 
                fill="#ffffff" 
                stroke="#10b981" 
                strokeWidth={1} 
                rx={4} 
            />
            <text 
                x={x + 6 + badgeWidth / 2} 
                y={labelY + 3} 
                fill="#064e3b" 
                fontSize={8} 
                fontWeight="bold" 
                textAnchor="middle"
            >
                {valStr}
            </text>
        </g>
    );
};

const renderSellerBarLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value === undefined || value === null) return null;
    const valStr = `S/ ${Math.round(Number(value)).toLocaleString('es-PE')}`;
    const badgeWidth = Math.max(52, valStr.length * 6.2);
    const labelY = y + height / 2;
    return (
        <g>
            <rect 
                x={x + 6} 
                y={labelY - 7} 
                width={badgeWidth} 
                height={14} 
                fill="#ffffff" 
                stroke="#0ea5e9" 
                strokeWidth={1} 
                rx={4} 
            />
            <text 
                x={x + 6 + badgeWidth / 2} 
                y={labelY + 3} 
                fill="#0369a1" 
                fontSize={8} 
                fontWeight="bold" 
                textAnchor="middle"
            >
                {valStr}
            </text>
        </g>
    );
};

export function Dashboard({ data, onSaveSuccess }: DashboardProps) {
    const page1Ref = useRef<HTMLDivElement>(null);
    const page2Ref = useRef<HTMLDivElement>(null);
    const [timeView, setTimeView] = useState<'daily' | 'monthly'>('daily');
    const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showLabels, setShowLabels] = useState(true); // Always display values on charts statically by default

    // Search and pagination state for Table View
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const downloadPDF = async () => {
        if (!page1Ref.current || !page2Ref.current) return;
        setIsExporting(true);

        // Wait a short moment to make sure rendering is complete
        await new Promise((resolve) => setTimeout(resolve, 400));

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Render page 1
            const dataUrl1 = await toPng(page1Ref.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' });
            const imgProps1 = pdf.getImageProperties(dataUrl1);
            const pageHeight1 = (imgProps1.height * pdfWidth) / imgProps1.width;
            pdf.addImage(dataUrl1, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pageHeight1));

            // Render page 2
            pdf.addPage();
            const dataUrl2 = await toPng(page2Ref.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' });
            const imgProps2 = pdf.getImageProperties(dataUrl2);
            const pageHeight2 = (imgProps2.height * pdfWidth) / imgProps2.width;
            pdf.addImage(dataUrl2, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pageHeight2));

            pdf.save(`Reporte_Ventas_${timeView === 'daily' ? 'Diario' : 'Mensual'}.pdf`);
        } catch (err) {
            console.error("Error generating PDF", err);
        } finally {
            setIsExporting(false);
        }
    };

    // Calculate metrics with fallbacks for backwards compatibility
    const totalRevenue = data.kpi.totalRevenue ?? data.monthly.reduce((acc, curr) => acc + curr.revenue, 0);
    const grossProfit = data.kpi.totalProfit;
    const avgUtility = data.kpi.avgUtility;
    
    const rawSalesList = data.rawData || [];
    const totalOrders = data.kpi.totalOrders ?? rawSalesList.length ?? 0;
    const averageTicket = data.kpi.averageTicket ?? (totalOrders > 0 ? (totalRevenue / totalOrders) : 0);

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

    // Filter table rows
    const filteredRows = rawSalesList.filter(row => {
        const searchLower = searchTerm.toLowerCase();
        const product = String(row["Variante del producto"] || row.Descripcion || "").toLowerCase();
        const seller = String(row.Vendedor || row.Usuario || "").toLowerCase();
        const client = String(row.Cliente || "").toLowerCase();
        const order = String(row.Orden || row.Order || "").toLowerCase();
        return product.includes(searchLower) || seller.includes(searchLower) || client.includes(searchLower) || order.includes(searchLower);
    });

    const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
    const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Format dates cleanly
    const formatDateVal = (dateVal: any) => {
        if (!dateVal) return "-";
        if (typeof dateVal === 'number') {
            const utcDate = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
            return utcDate.toLocaleDateString('es-PE');
        }
        if (dateVal instanceof Date) {
            return dateVal.toLocaleDateString('es-PE');
        }
        const str = String(dateVal);
        if (str.includes('T')) return str.split('T')[0];
        if (str.includes(' ')) return str.split(' ')[0];
        return str;
    };

    const renderLabels = showLabels || isExporting;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Control Panel */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl border">
                    <button
                        onClick={() => setViewMode('charts')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            viewMode === 'charts'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Gráficos
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            viewMode === 'table'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Vista Tabla
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Time View Selector (Only if in Charts view) */}
                    {viewMode === 'charts' && (
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
                    )}

                    {/* Data Labels Toggle */}
                    {viewMode === 'charts' && (
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border px-3 py-2 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all select-none border-slate-200">
                            <input
                                type="checkbox"
                                checked={showLabels}
                                onChange={(e) => setShowLabels(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                            <span>Valores en gráficos</span>
                        </label>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={saveReport}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Guardando..." : "Guardar Reporte"}
                    </button>
                    {viewMode === 'charts' && (
                        <button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Descargar PDF
                        </button>
                    )}
                </div>
            </div>

            {viewMode === 'charts' ? (
                <div className="space-y-8">
                    {/* PAGE 1: Header, KPIs, Revenue vs Profit */}
                    <div ref={page1Ref} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-8">
                        <header className="border-b pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Resumen Ejecutivo</h2>
                                <p className="text-gray-500 mt-1.5">
                                    Análisis detallado de ventas, ganancias y rendimiento ({timeView === 'daily' ? 'Por día' : 'Por mes'}).
                                </p>
                                {data.kpi.startDate && data.kpi.endDate && (
                                    <p className="text-sm font-semibold text-indigo-600 mt-2 bg-indigo-50 inline-block px-3 py-1 rounded-lg border border-indigo-100">
                                        Período: {data.kpi.startDate} al {data.kpi.endDate}
                                    </p>
                                )}
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 self-start sm:self-auto">
                                {timeView === 'daily' ? 'Diario' : 'Mensual'}
                            </span>
                        </header>

                        {/* KPI Section */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: Ingresos Totales */}
                            <div className="bg-gradient-to-br from-indigo-50/50 to-white p-6 rounded-2xl border border-indigo-100/50 shadow-sm flex flex-col justify-between">
                                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Ingresos Totales</span>
                                <div className="mt-4">
                                    <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(totalRevenue)}</span>
                                </div>
                            </div>

                            {/* Card 2: Ganancia Total */}
                            <div className="bg-gradient-to-br from-emerald-50/50 to-white p-6 rounded-2xl border border-emerald-100/50 shadow-sm flex flex-col justify-between">
                                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Ganancia Total (Margen)</span>
                                <div className="mt-4">
                                    <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(grossProfit)}</span>
                                </div>
                            </div>

                            {/* Card 3: Rentabilidad Global */}
                            <div className="bg-gradient-to-br from-violet-50/50 to-white p-6 rounded-2xl border border-violet-100/50 shadow-sm flex flex-col justify-between">
                                <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Rentabilidad Global</span>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-gray-900">{avgUtility.toFixed(1)}%</span>
                                    <span className="text-xs text-gray-500 font-medium">de ventas</span>
                                </div>
                            </div>

                            {/* Card 4: Ticket Promedio */}
                            <div className="bg-gradient-to-br from-amber-50/50 to-white p-6 rounded-2xl border border-amber-100/50 shadow-sm flex flex-col justify-between">
                                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Ticket Promedio</span>
                                <div className="mt-4 flex flex-col">
                                    <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(averageTicket)}</span>
                                    <span className="text-xs text-gray-500 font-medium mt-1">en {totalOrders} órdenes</span>
                                </div>
                            </div>
                        </section>

                        {/* Revenue vs Profit Chart */}
                        <div className="border-t pt-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                                Ingresos vs Ganancias ({timeView === 'daily' ? 'Histórico Diario' : 'Histórico Mensual'})
                            </h3>
                            <div className="overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                                <div style={{ minWidth: `${Math.max(1000, activeData.length * (timeView === 'daily' ? 40 : 80))}px`, height: "450px" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={activeData} margin={{ top: 25, right: 30, left: 40, bottom: 25 }}>
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
                                            <Bar dataKey="revenue" name="Ingresos (PVenta)" barSize={timeView === 'daily' ? 15 : 30} fill="#4f46e5" radius={[4, 4, 0, 0]}>
                                                {renderLabels && (
                                                    <LabelList
                                                        dataKey="revenue"
                                                        content={renderBarLabel}
                                                    />
                                                )}
                                            </Bar>
                                            <Line type="monotone" dataKey="profit" name="Ganancia (Margen)" stroke="#10b981" strokeWidth={3} dot={{ r: timeView === 'daily' ? 1.5 : 3 }} activeDot={{ r: 5 }}>
                                                {renderLabels && (
                                                    <LabelList
                                                        dataKey="profit"
                                                        content={renderLineLabel}
                                                    />
                                                )}
                                            </Line>
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAGE 2: Star Products, Performance by Seller */}
                    <div ref={page2Ref} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-12">
                        {data.kpi.startDate && data.kpi.endDate && (
                            <div className="border-b pb-4 hidden print:block">
                                <p className="text-sm font-semibold text-indigo-600">
                                    Período del reporte: {data.kpi.startDate} al {data.kpi.endDate}
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            
                            {/* Top 10 Star Products */}
                            <div className="h-[650px] bg-slate-50/50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Top 10 Productos Estrella</h3>
                                    <p className="text-xs text-gray-500 mb-6">Ordenados por Ganancia Total Generada (Margen acumulado)</p>
                                </div>
                                <div className="flex-grow h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            layout="vertical"
                                            data={data.topProducts}
                                            margin={{ top: 5, right: 60, left: 10, bottom: 20 }}
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
                                            <Bar dataKey="value" name="Ganancia Total (Margen)" fill="#10b981" radius={[0, 6, 6, 0]} barSize={25}>
                                                {renderLabels && (
                                                    <LabelList
                                                        dataKey="value"
                                                        content={renderHorizontalBarLabel}
                                                    />
                                                )}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Performance by Seller */}
                            <div className="h-[650px] bg-slate-50/50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Rendimiento por Vendedor</h3>
                                    <p className="text-xs text-gray-500 mb-6 font-medium">Ventas totales acumuladas (PVenta)</p>
                                </div>
                                <div className="flex-grow h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            layout="vertical"
                                            data={data.sellers}
                                            margin={{ top: 5, right: 60, left: 10, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" tickFormatter={(val) => `S/ ${val}`} tick={{ fontSize: 11 }} />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={150}
                                                tick={{ fontSize: 12, fill: '#4B5563', fontWeight: 500 }}
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
                                                {renderLabels && (
                                                    <LabelList
                                                        dataKey="value"
                                                        content={renderSellerBarLabel}
                                                    />
                                                )}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ) : (
                /* PREMIUM TABLE VIEW */
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Listado de Transacciones</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Visualiza y busca todos los registros detallados de este período.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            <input
                                type="text"
                                placeholder="Buscar producto, vendedor..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                            />
                        </div>
                    </div>

                    {rawSalesList.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            No hay detalles de registros individuales en este reporte.
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            No se encontraron registros que coincidan con la búsqueda.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                                <table className="w-full border-collapse text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Orden</th>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Variante del Producto</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4">Vendedor</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                            <th className="px-6 py-4 text-right">Margen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {paginatedRows.map((row, idx) => {
                                            const totalVal = Number(row.Total) || Number(row.PVenta) || 0;
                                            const margenVal = Number(row.Margen) || Number(row.Ganancia) || 0;
                                            return (
                                                <tr key={row._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                        {row.Orden || row.Order || "-"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {formatDateVal(row["Fecha de la orden"] || row.Fecha)}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate" title={String(row["Variante del producto"] || row.Descripcion || "")}>
                                                        {String(row["Variante del producto"] || row.Descripcion || "-")}
                                                    </td>
                                                    <td className="px-6 py-4 max-w-[150px] truncate font-medium text-slate-700" title={row.Cliente}>
                                                        {row.Cliente || "-"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                            {row.Vendedor || row.Usuario || "-"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-slate-950">
                                                        {formatCurrency(totalVal)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                                                        {formatCurrency(margenVal)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100 mt-4">
                                    <span className="text-xs text-slate-500 font-medium">
                                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredRows.length)} de {filteredRows.length} registros
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                                        </button>
                                        <span className="text-sm font-semibold text-slate-700 px-3">
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
