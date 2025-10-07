from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus.frames import Frame
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics import renderPDF
from io import BytesIO
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PDFGenerator:
    def __init__(self):
        # Colores corporativos (definir ANTES de setup_custom_styles)
        self.primary_color = colors.Color(0.2, 0.3, 0.5)  # Azul corporativo
        self.secondary_color = colors.Color(0.8, 0.4, 0.1)  # Naranja
        self.accent_color = colors.Color(0.1, 0.5, 0.2)  # Verde
        self.gray_color = colors.Color(0.5, 0.5, 0.5)  # Gris
        
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Configurar estilos profesionales personalizados"""
        
        # Título principal
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            spaceBefore=20,
            alignment=TA_CENTER,
            textColor=self.primary_color,
            fontName='Helvetica-Bold'
        )
        
        # Subtítulo
        self.subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=25,
            spaceBefore=15,
            alignment=TA_CENTER,
            textColor=self.secondary_color,
            fontName='Helvetica-Bold'
        )
        
        # Encabezado de sección
        self.section_header_style = ParagraphStyle(
            'SectionHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            spaceAfter=15,
            spaceBefore=20,
            alignment=TA_LEFT,
            textColor=self.primary_color,
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor=self.primary_color,
            borderPadding=5,
            backColor=colors.Color(0.95, 0.95, 0.98)
        )
        
        # Texto normal mejorado
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            alignment=TA_JUSTIFY,
            textColor=colors.black,
            fontName='Helvetica'
        )
        
        # Estilo para metadatos
        self.metadata_style = ParagraphStyle(
            'Metadata',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=5,
            alignment=TA_RIGHT,
            textColor=self.gray_color,
            fontName='Helvetica-Oblique'
        )
        
        # Estilo para pie de página
        self.footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=self.gray_color,
            fontName='Helvetica'
        )
    
    def create_professional_header(self, title: str, subtitle: str = ""):
        """Crear encabezado profesional del reporte"""
        elements = []
        
        # Línea decorativa superior
        elements.append(Spacer(1, 10))
        
        # Título principal con diseño corporativo
        elements.append(Paragraph("🏀 BASKETBALL SCOREBOARD SYSTEM", self.title_style))
        elements.append(Spacer(1, 5))
        
        # Línea separadora
        line_data = [[''] * 5]
        line_table = Table(line_data, colWidths=[4*inch])
        line_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 2, self.primary_color),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(line_table)
        elements.append(Spacer(1, 15))
        
        # Título del reporte
        elements.append(Paragraph(title, self.subtitle_style))
        
        if subtitle:
            elements.append(Paragraph(subtitle, self.section_header_style))
        
        # Información del reporte
        fecha = datetime.now().strftime("%d de %B de %Y")
        hora = datetime.now().strftime("%H:%M:%S")
        
        info_data = [
            ['Fecha de Generación:', fecha],
            ['Hora:', hora],
            ['Sistema:', 'Basketball Scoreboard v2.0'],
            ['Desarrollado por:', 'Alejandro Sazo - Universidad Mariano Gálvez']
        ]
        
        info_table = Table(info_data, colWidths=[2*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), self.primary_color),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        elements.append(info_table)
        elements.append(Spacer(1, 25))
        
        return elements
    
    def create_professional_table(self, data, headers, title=""):
        """Crear tabla profesional con estilo corporativo"""
        elements = []
        
        if title:
            elements.append(Paragraph(title, self.section_header_style))
            elements.append(Spacer(1, 10))
        
        if not data or len(data) == 0:
            elements.append(Paragraph("No hay datos disponibles para mostrar.", self.normal_style))
            return elements
        
        # Preparar datos con encabezados
        table_data = [headers] + data
        
        # Calcular anchos de columna dinámicamente
        col_count = len(headers)
        available_width = 7 * inch
        col_width = available_width / col_count
        col_widths = [col_width] * col_count
        
        table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
        # Estilo profesional para la tabla
        table_style = [
            # Encabezado
            ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Filas de datos
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 1), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            
            # Bordes y colores alternos
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('LINEBELOW', (0, 0), (-1, 0), 2, self.primary_color),
        ]
        
        # Colores alternos para filas
        for i in range(1, len(table_data)):
            if i % 2 == 0:
                table_style.append(('BACKGROUND', (0, i), (-1, i), colors.Color(0.95, 0.95, 0.98)))
            else:
                table_style.append(('BACKGROUND', (0, i), (-1, i), colors.white))
        
        table.setStyle(TableStyle(table_style))
        elements.append(table)
        
        return elements
    
    def create_footer(self, total_items=None):
        """Crear pie de página profesional"""
        elements = []
        elements.append(Spacer(1, 20))
        
        # Línea separadora
        line_data = [[''] * 5]
        line_table = Table(line_data, colWidths=[4*inch])
        line_table.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (-1, -1), 1, self.gray_color),
        ]))
        elements.append(line_table)
        elements.append(Spacer(1, 10))
        
        if total_items is not None:
            elements.append(Paragraph(f"<b>Total de registros:</b> {total_items}", self.normal_style))
            elements.append(Spacer(1, 5))
        
        # Información del pie
        footer_text = """
        <b>Basketball Scoreboard System</b><br/>
        Universidad Mariano Gálvez de Guatemala<br/>
        Desarrollo Web II - Proyecto 3<br/>
        © 2025 Alejandro Sazo - Todos los derechos reservados
        """
        elements.append(Paragraph(footer_text, self.footer_style))
        
        return elements
    
    def generar_reporte_equipos(self, equipos):
        """RF-REP-01: Generar reporte profesional de equipos"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer, 
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            elements = []
            
            # Encabezado profesional
            elements.extend(self.create_professional_header(
                "REPORTE DE EQUIPOS REGISTRADOS",
                "Listado completo de equipos en el sistema"
            ))
            
            if not equipos or len(equipos) == 0:
                elements.append(Paragraph(
                    "⚠️ No hay equipos registrados en el sistema en este momento.", 
                    self.normal_style
                ))
                elements.append(Spacer(1, 10))
                elements.append(Paragraph(
                    "Para comenzar a usar el sistema, registre al menos un equipo desde el panel de administración.", 
                    self.normal_style
                ))
            else:
                # Preparar datos para la tabla
                headers = ['ID', 'Nombre del Equipo', 'Ciudad', 'Color Primario', 'Color Secundario', 'Estado']
                data = []
                
                for equipo in equipos:
                    data.append([
                        str(equipo.get('Id', 'N/A')),
                        equipo.get('Nombre', 'Sin nombre'),
                        equipo.get('Ciudad', 'No especificada'),
                        equipo.get('ColorPrimario', '#000000'),
                        equipo.get('ColorSecundario', '#FFFFFF'),
                        '✅ Activo' if equipo.get('Activo', True) else '❌ Inactivo'
                    ])
                
                # Crear tabla profesional
                table_elements = self.create_professional_table(
                    data, 
                    headers, 
                    "📊 Detalle de Equipos Registrados"
                )
                elements.extend(table_elements)
                
                # Estadísticas adicionales
                elements.append(Spacer(1, 20))
                elements.append(Paragraph("📈 Estadísticas del Reporte", self.section_header_style))
                elements.append(Spacer(1, 10))
                
                equipos_activos = sum(1 for equipo in equipos if equipo.get('Activo', True))
                equipos_inactivos = len(equipos) - equipos_activos
                
                stats_data = [
                    ['Total de equipos registrados:', str(len(equipos))],
                    ['Equipos activos:', str(equipos_activos)],
                    ['Equipos inactivos:', str(equipos_inactivos)],
                    ['Porcentaje de equipos activos:', f"{(equipos_activos/len(equipos)*100):.1f}%"]
                ]
                
                stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
                stats_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 11),
                    ('TEXTCOLOR', (0, 0), (0, -1), self.primary_color),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 5),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                    ('LINEBELOW', (0, -1), (-1, -1), 1, self.gray_color),
                ]))
                elements.append(stats_table)
            
            # Pie de página profesional
            elements.extend(self.create_footer(len(equipos) if equipos else 0))
            
            doc.build(elements)
            buffer.seek(0)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generando PDF profesional de equipos: {e}")
            raise
    
    def generar_reporte_jugadores(self, jugadores, equipo_id):
        """RF-REP-02: Generar reporte profesional de jugadores por equipo"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer, 
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            elements = []
            
            # Encabezado profesional
            elements.extend(self.create_professional_header(
                f"REPORTE DE JUGADORES - EQUIPO {equipo_id}",
                "Roster completo del equipo seleccionado"
            ))
            
            if not jugadores or len(jugadores) == 0:
                elements.append(Paragraph(
                    f"⚠️ No hay jugadores registrados para el equipo ID: {equipo_id}", 
                    self.normal_style
                ))
                elements.append(Spacer(1, 10))
                elements.append(Paragraph(
                    "Para agregar jugadores, utilice el panel de administración del sistema.", 
                    self.normal_style
                ))
            else:
                # Preparar datos para la tabla
                headers = ['#', 'Nombre Completo', 'Número', 'Posición', 'Altura', 'Nacionalidad']
                data = []
                
                for jugador in jugadores:
                    data.append([
                        str(jugador.get('Id', 'N/A')),
                        jugador.get('NombreCompleto', 'Sin nombre'),
                        f"#{jugador.get('Numero', '0')}",
                        jugador.get('Posicion', 'No especificada'),
                        f"{jugador.get('Estatura', 'N/A')}m" if jugador.get('Estatura') else 'N/A',
                        jugador.get('Nacionalidad', 'No especificada')
                    ])
                
                # Crear tabla profesional
                table_elements = self.create_professional_table(
                    data, 
                    headers, 
                    f"👥 Roster del Equipo {equipo_id}"
                )
                elements.extend(table_elements)
                
                # Estadísticas del equipo
                elements.append(Spacer(1, 20))
                elements.append(Paragraph("📊 Análisis del Roster", self.section_header_style))
                elements.append(Spacer(1, 10))
                
                # Contar posiciones
                posiciones = {}
                for jugador in jugadores:
                    pos = jugador.get('Posicion', 'No especificada')
                    posiciones[pos] = posiciones.get(pos, 0) + 1
                
                stats_data = [
                    ['Total de jugadores:', str(len(jugadores))],
                    ['Equipo:', jugadores[0].get('EquipoNombre', f'Equipo {equipo_id}') if jugadores else f'Equipo {equipo_id}']
                ]
                
                # Agregar distribución por posiciones
                for pos, count in posiciones.items():
                    stats_data.append([f'Jugadores en {pos}:', str(count)])
                
                stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
                stats_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 11),
                    ('TEXTCOLOR', (0, 0), (0, -1), self.primary_color),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 5),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                    ('LINEBELOW', (0, -1), (-1, -1), 1, self.gray_color),
                ]))
                elements.append(stats_table)
            
            # Pie de página profesional
            elements.extend(self.create_footer(len(jugadores) if jugadores else 0))
            
            doc.build(elements)
            buffer.seek(0)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generando PDF profesional de jugadores: {e}")
            raise
    
    def generar_reporte_partidos(self, partidos):
        """RF-REP-03: Generar reporte profesional de partidos"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer, 
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            elements = []
            
            # Encabezado profesional
            elements.extend(self.create_professional_header(
                "HISTORIAL DE PARTIDOS",
                "Registro completo de encuentros deportivos"
            ))
            
            if not partidos or len(partidos) == 0:
                elements.append(Paragraph(
                    "⚠️ No hay partidos registrados en el sistema.", 
                    self.normal_style
                ))
                elements.append(Spacer(1, 10))
                elements.append(Paragraph(
                    "Los partidos aparecerán aquí una vez que sean programados desde el panel de administración.", 
                    self.normal_style
                ))
            else:
                # Preparar datos para la tabla
                headers = ['ID', 'Equipo Local', 'Equipo Visitante', 'Resultado Final', 'Estado', 'Fecha']
                data = []
                
                partidos_finalizados = 0
                partidos_programados = 0
                
                for partido in partidos:
                    marcador_local = partido.get('MarcadorFinalLocal')
                    marcador_visitante = partido.get('MarcadorFinalVisitante')
                    
                    if marcador_local is not None and marcador_visitante is not None:
                        resultado = f"{marcador_local} - {marcador_visitante}"
                        estado = "🏁 Finalizado"
                        partidos_finalizados += 1
                    else:
                        resultado = "Por jugar"
                        estado = "📅 Programado"
                        partidos_programados += 1
                    
                    fecha = partido.get('Fecha', 'No especificada')
                    if fecha and fecha != 'No especificada':
                        try:
                            # Intentar formatear la fecha si viene en formato datetime
                            fecha = fecha.strftime('%d/%m/%Y') if hasattr(fecha, 'strftime') else str(fecha)
                        except:
                            fecha = str(fecha)
                    
                    data.append([
                        str(partido.get('Id', 'N/A')),
                        partido.get('EquipoLocalNombre', partido.get('EquipoLocal', 'Equipo Local')),
                        partido.get('EquipoVisitanteNombre', partido.get('EquipoVisitante', 'Equipo Visitante')),
                        resultado,
                        estado,
                        fecha
                    ])
                
                # Crear tabla profesional
                table_elements = self.create_professional_table(
                    data, 
                    headers, 
                    "🏀 Registro de Encuentros Deportivos"
                )
                elements.extend(table_elements)
                
                # Estadísticas de partidos
                elements.append(Spacer(1, 20))
                elements.append(Paragraph("📈 Estadísticas de Partidos", self.section_header_style))
                elements.append(Spacer(1, 10))
                
                total_partidos = len(partidos)
                porcentaje_finalizados = (partidos_finalizados / total_partidos * 100) if total_partidos > 0 else 0
                
                stats_data = [
                    ['Total de partidos:', str(total_partidos)],
                    ['Partidos finalizados:', str(partidos_finalizados)],
                    ['Partidos programados:', str(partidos_programados)],
                    ['Porcentaje completado:', f"{porcentaje_finalizados:.1f}%"]
                ]
                
                stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
                stats_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 11),
                    ('TEXTCOLOR', (0, 0), (0, -1), self.primary_color),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 5),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                    ('LINEBELOW', (0, -1), (-1, -1), 1, self.gray_color),
                ]))
                elements.append(stats_table)
            
            # Pie de página profesional
            elements.extend(self.create_footer(len(partidos) if partidos else 0))
            
            doc.build(elements)
            buffer.seek(0)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generando PDF profesional de partidos: {e}")
            raise
    
    def generar_reporte_roster(self, roster, partido_id):
        """RF-REP-04: Generar reporte profesional de roster"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer, 
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            elements = []
            
            # Encabezado profesional
            elements.extend(self.create_professional_header(
                f"ROSTER DEL PARTIDO #{partido_id}",
                "Jugadores participantes en el encuentro"
            ))
            
            if not roster or len(roster) == 0:
                elements.append(Paragraph(
                    f"⚠️ No hay jugadores registrados para mostrar en el roster del partido #{partido_id}.", 
                    self.normal_style
                ))
                elements.append(Spacer(1, 10))
                elements.append(Paragraph(
                    "Para generar este reporte, primero debe:", 
                    self.normal_style
                ))
                elements.append(Spacer(1, 5))
                elements.append(Paragraph(
                    "1. Crear equipos en el panel de administración<br/>2. Registrar jugadores para cada equipo<br/>3. Crear un partido entre los equipos", 
                    self.normal_style
                ))
            else:
                elements.append(Paragraph(
                    "📋 Este reporte muestra los jugadores que participaron en el encuentro deportivo.", 
                    self.normal_style
                ))
                elements.append(Spacer(1, 15))
                
                # Información del partido
                elements.append(Paragraph("🏀 Información del Encuentro", self.section_header_style))
                elements.append(Spacer(1, 10))
                
                partido_info = [
                    ['Partido ID:', str(partido_id)],
                    ['Total de jugadores:', str(len(roster))],
                    ['Fecha del reporte:', datetime.now().strftime('%d/%m/%Y')],
                    ['Estado:', 'Roster confirmado']
                ]
                
                info_table = Table(partido_info, colWidths=[2*inch, 3*inch])
                info_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 11),
                    ('TEXTCOLOR', (0, 0), (0, -1), self.primary_color),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 5),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ]))
                elements.append(info_table)
                elements.append(Spacer(1, 20))
                
                # Tabla de jugadores del roster
                elements.append(Paragraph("👥 Lista de Jugadores Participantes", self.section_header_style))
                elements.append(Spacer(1, 10))
                
                headers = ['#', 'Nombre Completo', 'Posición', 'Equipo']
                data = []
                
                for jugador in roster:
                    data.append([
                        str(jugador.get('Numero', 'N/A')),
                        jugador.get('NombreCompleto', 'Jugador'),
                        jugador.get('Posicion', 'N/A'),
                        jugador.get('EquipoNombre', 'Equipo')
                    ])
                
                # Crear tabla profesional del roster
                table_elements = self.create_professional_table(
                    data, 
                    headers, 
                    "🏀 Jugadores del Partido"
                )
                elements.extend(table_elements)
            
            # Pie de página profesional
            elements.extend(self.create_footer(len(roster) if roster else 0))
            
            doc.build(elements)
            buffer.seek(0)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generando PDF profesional de roster: {e}")
            raise
    
    def generar_reporte_estadisticas(self, estadisticas, jugador_id):
        """RF-REP-05: Generar reporte profesional de estadísticas"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer, 
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            elements = []
            
            # Encabezado profesional
            elements.extend(self.create_professional_header(
                f"ESTADÍSTICAS DEL JUGADOR #{jugador_id}",
                "Análisis de rendimiento deportivo"
            ))
            
            if not estadisticas or len(estadisticas) == 0:
                elements.append(Paragraph(
                    f"⚠️ No hay estadísticas disponibles para el jugador #{jugador_id}.", 
                    self.normal_style
                ))
                elements.append(Spacer(1, 10))
                elements.append(Paragraph(
                    "Las estadísticas se generarán automáticamente cuando el jugador participe en partidos.", 
                    self.normal_style
                ))
            else:
                # Obtener datos del primer registro de estadísticas
                stats = estadisticas[0] if estadisticas else {}
                nombre_jugador = stats.get('NombreJugador', f'Jugador #{jugador_id}')
                
                elements.append(Paragraph(
                    f"📊 Análisis detallado del rendimiento de {nombre_jugador}.", 
                    self.normal_style
                ))
                elements.append(Spacer(1, 15))
                
                # Información del jugador
                elements.append(Paragraph("🏀 Información del Jugador", self.section_header_style))
                elements.append(Spacer(1, 10))
                
                jugador_info = [
                    ['Jugador:', nombre_jugador],
                    ['ID:', str(jugador_id)],
                    ['Partidos jugados:', str(stats.get('PartidosJugados', 0))],
                    ['Fecha del análisis:', datetime.now().strftime('%d/%m/%Y')],
                    ['Estado:', 'Estadísticas actualizadas']
                ]
                
                info_table = Table(jugador_info, colWidths=[2*inch, 3*inch])
                info_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 11),
                    ('TEXTCOLOR', (0, 0), (0, -1), self.primary_color),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 5),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ]))
                elements.append(info_table)
                elements.append(Spacer(1, 20))
                
                # Estadísticas de rendimiento
                elements.append(Paragraph("📈 Métricas de Rendimiento", self.section_header_style))
                elements.append(Spacer(1, 10))
                
                stats_data = [
                    ['Puntos por partido:', f"{stats.get('PuntosPromedio', 0):.1f}"],
                    ['Rebotes por partido:', f"{stats.get('RebotesPromedio', 0):.1f}"],
                    ['Asistencias por partido:', f"{stats.get('AsistenciasPromedio', 0):.1f}"],
                    ['Minutos jugados:', f"{stats.get('MinutosJugados', 0):.1f}"],
                    ['Porcentaje de tiros:', f"{stats.get('PorcentajeTiros', 0):.1f}%"]
                ]
                
                stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
                stats_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 12),
                    ('TEXTCOLOR', (0, 0), (0, -1), self.primary_color),
                    ('TEXTCOLOR', (1, 0), (1, -1), self.accent_color),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('LINEBELOW', (0, 0), (-1, -1), 1, self.gray_color),
                ]))
                elements.append(stats_table)
            
            # Pie de página profesional
            elements.extend(self.create_footer(len(estadisticas) if estadisticas else 0))
            
            doc.build(elements)
            buffer.seek(0)
            return buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error generando PDF profesional de estadísticas: {e}")
            raise
