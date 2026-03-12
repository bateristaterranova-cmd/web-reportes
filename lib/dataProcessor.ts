import { read, utils } from "xlsx";

type SalesData = {
    Fecha: string | number | Date;
    Comprobante?: string;
    Serie?: string;
    Numero?: string | number;
    Numdoc?: string | number;
    Clientes?: string;
    Codigo?: string;
    Descripcion?: string;
    UM?: string;
    Cantidad?: number;
    Moneda?: string;
    PUnidad?: number;
    PCompra?: number;
    PUnitario?: number;
    PVenta?: number;
    Ganancia?: number;
    Utilidad?: string | number;
    Usuario?: string;
    [key: string]: any;
};

export async function processExcelFile(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData = utils.sheet_to_json<SalesData>(sheet);

    const monthlyStats: Record<string, { revenue: number; profit: number }> = {};
    const yearlyStats: Record<string, number> = {};
    const productStats: Record<string, number> = {};
    const sellerStats: Record<string, number> = {};

    let totalProfit = 0;
    let totalUtility = 0;
    let utilityCount = 0;

    rawData.forEach((row) => {
        let dateObj: Date | null = null;
        const rawDate = row.Fecha;

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
                const parts = rawDate.split('-');
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

        const revenue = Number(row.PVenta) || 0;
        const profit = Number(row.Ganancia) || 0;

        let utility = 0;
        if (typeof row.Utilidad === 'string') {
            utility = parseFloat(row.Utilidad.replace('%', ''));
        } else if (typeof row.Utilidad === 'number') {
            utility = row.Utilidad;
        }

        const product = String(row.Descripcion || "Desconocido").trim();
        const seller = String(row.Usuario || "Desconocido").trim();

        if (dateObj && !isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const monthNum = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const keyMonth = `${year}-${monthNum}`;

            if (!monthlyStats[keyMonth]) {
                monthlyStats[keyMonth] = { revenue: 0, profit: 0 };
            }
            monthlyStats[keyMonth].revenue += revenue;
            monthlyStats[keyMonth].profit += profit;

            yearlyStats[year] = (yearlyStats[year] || 0) + revenue;
        }

        totalProfit += profit;
        if (!isNaN(utility)) {
            totalUtility += utility;
            utilityCount++;
        }

        if (product) {
            productStats[product] = (productStats[product] || 0) + revenue;
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

    const yearlyData = Object.entries(yearlyStats)
        .map(([name, value]) => ({
            name,
            value,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const topProducts = Object.entries(productStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    const sellerData = Object.entries(sellerStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const avgUtility = utilityCount > 0 ? (totalUtility / utilityCount) : 0;

    return {
        monthly: monthlyData,
        yearly: yearlyData,
        topProducts,
        sellers: sellerData,
        kpi: {
            totalProfit,
            avgUtility,
        },
    };
}
