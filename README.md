# Sales Intel - Reportes de Ventas Dinámicos

Este proyecto es un panel de control de análisis de ventas interactivo de nivel profesional, diseñado para procesar y visualizar reportes en formato CSV de manera instantánea directamente en el navegador.

## 🚀 Características

- **Carga de Datos Dinámica:** Permite subir o arrastrar y soltar cualquier reporte CSV de ventas para recalcular y actualizar todo el panel de control de forma inmediata.
- **Métricas Clave (KPIs):** Calcula automáticamente el total de ingresos, margen total, ticket promedio y número de órdenes únicas.
- **Rendimiento de Vendedores:** Genera un listado ordenado del rendimiento de los vendedores basado en la cantidad de órdenes gestionadas con barras de progreso visuales.
- **Análisis por Categoría:** Clasifica dinámicamente los productos vendidos en categorías principales (Guitarras, Teclados, Violines y Accesorios) mostrando la distribución de ingresos tanto en valor monetario como en porcentaje.
- **Tendencia de Ventas Diaria:** Visualiza la evolución de ventas diarias a través de un gráfico de línea SVG interactivo y fluido con tooltips dinámicos sobre cada punto, y con opción de alternar a una vista tabular de datos.
- **Transacciones Recientes:** Muestra una tabla detallada con las últimas 15 transacciones, incluyendo fechas, clientes, productos, montos y márgenes.
- **Exportación Profesional a PDF:** Configurado con estilos de impresión optimizados (`@media print`) para generar informes en PDF limpios y profesionales a través de la función nativa de impresión del navegador.

## 🛠️ Stack Tecnológico

- **Estructura e Interfaz:** HTML5 y JavaScript moderno (ES6+).
- **Estilos:** Tailwind CSS (cargado vía CDN) con una paleta de colores premium basada en tonos esmeralda y pizarra.
- **Procesador de Archivos:** [PapaParse](https://www.papaparse.com/) (cargado de forma segura desde CDN) para un análisis rápido de archivos CSV en el cliente.

## 💻 Cómo Ejecutar el Proyecto

1. **Localmente:**
   - Simplemente haz doble clic en el archivo `index.html` para abrirlo en cualquier navegador web moderno.
   - El panel se cargará automáticamente con los datos del reporte de muestra (22 al 28 de junio de 2026).
   - Puedes arrastrar un nuevo archivo CSV al área de carga superior para actualizar el reporte inmediatamente.

2. **Servidor Local (Opcional):**
   Si prefieres ejecutarlo a través de un servidor HTTP local, puedes utilizar Python, Node.js u otra herramienta desde la terminal:
   ```bash
   # Usando Python
   python -m http.server 8000

   # Usando Node.js (npx)
   npx http-server
   ```
   Luego abre tu navegador en `http://localhost:8000`.

## 🌐 Despliegue en GitHub Pages (Recomendado)

Dado que este proyecto es 100% estático (corre completamente en el navegador del cliente sin necesidad de un backend), se puede alojar de manera gratuita en **GitHub Pages**:

1. Ve a la pestaña **Settings** (Configuración) de este repositorio en GitHub.
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment**, selecciona la rama `main` en "Branch" y haz clic en **Save**.
4. ¡Listo! En un par de minutos tu panel estará disponible públicamente en una URL como `https://<tu-usuario>.github.io/web-reportes/`.

---
*Desarrollado para Musixentral - Visualización de Ventas.*
