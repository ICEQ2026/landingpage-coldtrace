# ColdTrace — Landing Page

Landing page oficial de **ColdTrace**, una plataforma inteligente de monitoreo para la cadena de frío pensada para operaciones de retail y alimentos.

## Sobre el producto

ColdTrace centraliza en un solo dashboard todo lo que hoy se gestiona con termómetros sueltos y planillas en Excel. Está diseñada para gerentes de operaciones y de calidad en minimarkets, cámaras frigoríficas, almacenes y cocinas industriales.

La plataforma permite:

- **Monitoreo en tiempo real** de temperatura, humedad y aperturas de puerta, sensor por sensor.
- **Alertas instantáneas** por correo y mensajería cuando una lectura se sale de rango.
- **Historial completo** de cada activo, sede y periodo, exportable en CSV o PDF.
- **Reportes listos para auditoría**, alineados con los requisitos de DIGESA y MINSA en Perú.

## Sobre este repositorio

Contiene el código fuente de la landing page pública del producto: una web estática, liviana y responsiva, con soporte bilingüe (Inglés y Español Latam) que se puede alternar desde el navbar.

### Estructura

```
index.html
assets/
├── icons/      SVGs de cada sección
├── images/     fotografías, avatares y arte de marca
├── locales/    traducciones (en-US, es-419)
├── scripts/    lógica de i18n, navegación y animaciones
└── styles/     estilos base y componentes
```

### Cómo verla en local

Basta con abrir `index.html` en cualquier navegador moderno, o levantar un servidor estático desde la raíz del proyecto:

```
python3 -m http.server
```

Luego visitar `http://localhost:8000`.
