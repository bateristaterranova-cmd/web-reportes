import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const reportes = await prisma.reporte.findMany({
      orderBy: { fecha: 'desc' }
    })
    return NextResponse.json(reportes)
  } catch (error) {
    console.error("Error fetching reportes", error)
    return NextResponse.json({ error: "No se pudieron obtener los reportes" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { mes, anio, ingresosTotales, gastosOperativos, gananciaNeta, detallesExtra } = body

    if (!mes || !anio || ingresosTotales === undefined) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    const nuevoReporte = await prisma.reporte.create({
      data: {
        mes,
        anio,
        ingresosTotales,
        gastosOperativos,
        gananciaNeta,
        detallesExtra: typeof detallesExtra === 'string' ? detallesExtra : JSON.stringify(detallesExtra || {})
      }
    })

    return NextResponse.json(nuevoReporte)
  } catch (error) {
    console.error("Error saving reporte", error)
    return NextResponse.json({ error: "Error al guardar el reporte" }, { status: 500 })
  }
}
