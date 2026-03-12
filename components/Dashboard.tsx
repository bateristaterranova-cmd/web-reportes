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
    Area,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";
import { Download, Trash2, Plus } from "lucide-react";

interface DashboardProps {
    data: {
        monthly: { name: string; revenue: number; profit: number }[];
        yearly: { name: string; value: number }[];
        topProducts: { name: string; value: number }[];
        sellers: { name: string; value: number }[];
        kpi: {
            totalProfit: number;
            avgUtility: number;
        }
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface Expense {
    id: string;
    description: string;
    category: string;
    amount: number;
}

const INITIAL_EXPENSES: Expense[] = [
    { id: '1', description: 'Richard (Planilla)', category: 'Planilla', amount: 2600 },
    { id: '2', description: 'Lucero (Planilla)', category: 'Planilla', amount: 1400 },
    { id: '3', description: 'Nelson (Planilla)', category: 'Planilla', amount: 1000 },
    { id: '4', description: 'Alquiler Local', category: 'Fijos', amount: 4500 },
    { id: '5', description: 'Luz', category: 'Fijos', amount: 270 },
    { id: '6', description: 'Agua', category: 'Fijos', amount: 60 },
    { id: '7', description: 'Internet', category: 'Fijos', amount: 40 },
];

export function Dashboard({ data }: DashboardProps) {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '' });

    const downloadPDF = async () => {
        if (!dashboardRef.current) return;

        try {
            const dataUrl = await toPng(dashboardRef.current, { cacheBust: true, pixelRatio: 2 });
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Explicitly generate a Blob with strictly 'application/pdf' MIME type
            const pdfBlob = pdf.output('blob');
            const blobUrl = URL.createObjectURL(pdfBlob);

            // Manually trigger download to force correct filename and extension
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = "Reporte_Ventas_MusicPro.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Release memory immediately after download
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (err) {
            console.error("Error generating PDF", err);
        }
    };

    const totalRevenue = data.yearly.reduce((acc, curr) => acc + curr.value, 0);
    const totalMonthlyExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const monthsCount = data.monthly.length;
    const totalPeriodExpenses = totalMonthlyExpenses * monthsCount;

    const netProfit = totalRevenue - totalPeriodExpenses;

    const monthlyDataWithNet = data.monthly.map(m => ({
        ...m,
        grossProfit: m.profit,
        netProfit: m.revenue - totalMonthlyExpenses,
    }));

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-end mb-6">
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                </button>
            </div>

            <div ref={dashboardRef} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-12">
                <header className="mb-8 border-b pb-6">
                    <h2 className="text-3xl font-bold text-gray-900">Resumen Ejecutivo</h2>
                    <p className="text-gray-500 mt-2">Análisis detallado de ventas, ganancias y rendimiento.</p>
                </header>

                {/* KPI Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
                    </div>
                    {/* <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Ganancia Bruta</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(grossProfit)}</p>
                    </div> */}
                    <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl border border-teal-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-teal-600 uppercase tracking-wide">Ganancia Neta</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(netProfit)}</p>
                    </div>
                    {/* <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-amber-600 uppercase tracking-wide">Utilidad Promed.</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{data.kpi.avgUtility.toFixed(2)}%</p>
                    </div> */}
                    <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Mejor Año</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            {data.yearly.length > 0
                                ? data.yearly.reduce((prev, current) => (prev.value > current.value) ? prev : current).name
                                : "-"}
                        </p>
                    </div>
                </section>

                {/* Expenses Module */}
                <section className="bg-white p-6 rounded-2xl border border-gray-100 mb-12 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Gastos Operativos Mensuales</h3>
                        <span className="text-lg font-bold text-red-500">- {formatCurrency(totalMonthlyExpenses)} / mes</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="overflow-y-auto max-h-64 pr-2 custom-scrollbar border rounded-lg">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Descripción</th>
                                            <th className="px-4 py-3 text-right">Monto</th>
                                            <th className="px-4 py-3 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.map(exp => (
                                            <tr key={exp.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-800">{exp.description}</td>
                                                <td className="px-4 py-3 text-right text-red-500 font-medium">- {formatCurrency(exp.amount)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))} className="text-gray-400 hover:text-red-500 transition-colors" title="Eliminar gasto">
                                                        <Trash2 className="w-4 h-4 inline" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-center">
                            <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Agregar Nuevo Gasto</h4>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    placeholder="Descripción (ej. Movilidad)"
                                    className="px-4 py-2 border rounded-lg w-full text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Monto Mensual (ej. 150)"
                                    className="px-4 py-2 border rounded-lg w-full text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                />
                                <button
                                    onClick={() => {
                                        if (newExpense.description && newExpense.amount) {
                                            setExpenses([...expenses, { id: Date.now().toString(), description: newExpense.description, category: 'Otros', amount: Number(newExpense.amount) }]);
                                            setNewExpense({ description: '', amount: '' });
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium mt-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar Gasto
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Revenue vs Profit (Scrollable) */}
                    <div className="col-span-1 lg:col-span-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Ingresos vs Ganancias (Histórico Mensual)</h3>
                        <div className="overflow-x-scroll overflow-y-hidden pb-4 custom-scrollbar">
                            <div style={{ minWidth: `${Math.max(1000, data.monthly.length * 80)}px`, height: "450px" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={monthlyDataWithNet} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                                        <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            scale="band"
                                            tick={{ fontSize: 12 }}
                                            label={{ value: 'Meses', position: 'insideBottomRight', offset: -10 }}
                                        />
                                        <YAxis
                                            tickFormatter={(val) => `S/ ${val}`}
                                            tick={{ fontSize: 12 }}
                                            width={80}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : "0"}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Bar dataKey="revenue" name="Ingresos Totales" barSize={30} fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                        {/* <Line type="monotone" dataKey="grossProfit" name="Ganancia Bruta" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} /> */}
                                        <Line type="monotone" dataKey="netProfit" name="Ganancia Neta" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Trend (Scrollable) */}
                    <div className="col-span-1 lg:col-span-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Tendencia Mensual de Ventas</h3>
                        <div className="overflow-x-scroll overflow-y-hidden pb-4 custom-scrollbar">
                            <div style={{ minWidth: `${Math.max(1000, data.monthly.length * 80)}px`, height: "400px" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.monthly} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
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
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 8 }}
                                            name="Ventas Totales"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>


                    {/* Top 10 Products */}
                    {/* Top 10 Products (Temporarily Hidden)
                    <div className="h-[650px] bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Top 10 Productos Estrella</h3>
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
                                <Bar dataKey="value" name="Ventas Totales" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div> */}

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
