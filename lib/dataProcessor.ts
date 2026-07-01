import { read, utils } from "xlsx";

export type SalesData = {
    "Fecha de la orden": string | number | Date;
    Total: number | string;
    Margen: number | string;
    "Variante del producto": string;
    Vendedor: string;
    "Cant. ordenada": number | string;
    Cliente?: string;
    Empresa?: string;
    Orden?: string;
    "Precio unitario"?: number | string;
    _id?: string; // used internally for unique keying
    [key: string]: any;
};

export async function parseExcelFile(file: File): Promise<SalesData[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData = utils.sheet_to_json<SalesData>(sheet);
    
    return rawData.map(row => ({
        ...row,
        _id: Math.random().toString(36).substring(2, 9)
    }));
}

export function aggregateData(rawData: SalesData[]) {
    const dailyStats: Record<string, { revenue: number; profit: number }> = {};
    const monthlyStats: Record<string, { revenue: number; profit: number }> = {};
    const productStats: Record<string, number> = {};
    const sellerStats: Record<string, number> = {};

    let totalProfit = 0;
    let totalRevenue = 0;
    const uniqueOrders = new Set<string>();

    rawData.forEach((row) => {
        let dateObj: Date | null = null;
        const rawDate = row["Fecha de la orden"] || row.Fecha;

        if (typeof rawDate === 'number') {
            const utcDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
            dateObj = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 12, 0, 0);
        } else if (typeof rawDate === 'string') {
            if (rawDate.includes('/')) {
                const parts = rawDate.split('/');
                if (parts.length === 3) {
                    dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0);
                } else {
                    dateObj = new Date(rawDate);
                    dateObj.setHours(12);
                }
            } else if (rawDate.includes('-')) {
                const parts = rawDate.split(' ')[0].split('-');
                if (parts.length >= 3) {
                    dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2].substring(0, 2)), 12, 0, 0);
                } else {
                    dateObj = new Date(rawDate);
                    dateObj.setHours(12);
                }
            } else {
                dateObj = new Date(rawDate);
                dateObj.setHours(12);
            }
        } else if (rawDate instanceof Date) {
            dateObj = rawDate;
        }

        const revenue = Number(row.Total) || Number(row.PVenta) || 0;
        const profit = Number(row.Margen) || Number(row.Ganancia) || 0;

        const product = String(row["Variante del producto"] || row.Descripcion || "Desconocido").trim();
        const seller = String(row.Vendedor || row.Usuario || "Desconocido").trim();
        
        const orderRef = row.Orden || row.Order;
        if (orderRef) {
            uniqueOrders.add(String(orderRef).trim());
        }

        if (dateObj && !isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const monthNum = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const dayNum = dateObj.getDate().toString().padStart(2, '0');
            
            const keyMonth = `${year}-${monthNum}`;
            const keyDay = `${year}-${monthNum}-${dayNum}`;

            // Monthly stats
            if (!monthlyStats[keyMonth]) {
                monthlyStats[keyMonth] = { revenue: 0, profit: 0 };
            }
            monthlyStats[keyMonth].revenue += revenue;
            monthlyStats[keyMonth].profit += profit;

            // Daily stats
            if (!dailyStats[keyDay]) {
                dailyStats[keyDay] = { revenue: 0, profit: 0 };
            }
            dailyStats[keyDay].revenue += revenue;
            dailyStats[keyDay].profit += profit;
        }

        totalProfit += profit;
        totalRevenue += revenue;

        // Top products by profit (Margen) rather than revenue (Total)
        if (product) {
            productStats[product] = (productStats[product] || 0) + profit;
        }

        if (seller) {
            sellerStats[seller] = (sellerStats[seller] || 0) + revenue;
        }
    });

    const monthlyData = Object.entries(monthlyStats)
        .map(([name, stats]) => ({
            name,
            revenue: stats.revenue,
            profit: stats.profit,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const dailyData = Object.entries(dailyStats)
        .map(([name, stats]) => ({
            name,
            revenue: stats.revenue,
            profit: stats.profit,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const topProducts = Object.entries(productStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    const sellerData = Object.entries(sellerStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const avgUtility = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const totalOrders = uniqueOrders.size > 0 ? uniqueOrders.size : rawData.length;
    const averageTicket = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    return {
        daily: dailyData,
        monthly: monthlyData,
        topProducts,
        sellers: sellerData,
        kpi: {
            totalProfit,
            avgUtility,
            totalRevenue,
            totalOrders,
            averageTicket,
        },
        rawData
    };
}
