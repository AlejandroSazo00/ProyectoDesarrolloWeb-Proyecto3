from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import logging
from .services.pdf_generator import PDFGenerator
from .models.database import execute_query

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Basketball Reports API",
    description="Servicio de generación de reportes en PDF para Basketball Scoreboard",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pdf_generator = PDFGenerator()

@app.get("/")
async def root():
    return {"message": "Basketball Reports API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "report-service"}

@app.get("/api/reports/equipos")
async def generar_reporte_equipos():
    """RF-REP-01: Reporte de Equipos Registrados"""
    try:
        logger.info("Generando reporte de equipos")
        
        # Obtener datos de equipos
        equipos = execute_query("SELECT * FROM equipos")
        
        if not equipos:
            logger.warning("No se encontraron equipos")
            equipos = []
        
        # Generar PDF
        pdf_content = pdf_generator.generar_reporte_equipos(equipos)
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=reporte_equipos.pdf"}
        )
        
    except Exception as e:
        logger.error(f"Error generando reporte de equipos: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")

@app.get("/api/reports/jugadores/{equipo_id}")
async def generar_reporte_jugadores(equipo_id: int):
    """RF-REP-02: Reporte de Jugadores por Equipo"""
    try:
        logger.info(f"Generando reporte de jugadores para equipo {equipo_id}")
        
        # Obtener datos de jugadores
        jugadores = execute_query("SELECT * FROM jugadores WHERE equipoId = ?", (equipo_id,))
        
        if not jugadores:
            logger.warning(f"No se encontraron jugadores para equipo {equipo_id}")
            jugadores = []
        
        # Generar PDF
        pdf_content = pdf_generator.generar_reporte_jugadores(jugadores, equipo_id)
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=reporte_jugadores_equipo_{equipo_id}.pdf"}
        )
        
    except Exception as e:
        logger.error(f"Error generando reporte de jugadores: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")

@app.get("/api/reports/partidos")
async def generar_reporte_partidos():
    """RF-REP-03: Reporte de Historial de Partidos"""
    try:
        logger.info("Generando reporte de partidos")
        
        # Obtener datos de partidos
        partidos = execute_query("SELECT * FROM partidos")
        
        if not partidos:
            logger.warning("No se encontraron partidos")
            partidos = []
        
        # Generar PDF
        pdf_content = pdf_generator.generar_reporte_partidos(partidos)
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=reporte_partidos.pdf"}
        )
        
    except Exception as e:
        logger.error(f"Error generando reporte de partidos: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")

@app.get("/api/reports/roster/{partido_id}")
async def generar_reporte_roster(partido_id: int):
    """RF-REP-04: Reporte de Roster por Partido"""
    try:
        logger.info(f"Generando reporte de roster para partido {partido_id}")
        
        # Obtener datos del roster
        roster = execute_query("SELECT * FROM roster WHERE partidoId = ?", (partido_id,))
        
        if not roster:
            logger.warning(f"No se encontró roster para partido {partido_id}")
            roster = []
        
        # Generar PDF
        pdf_content = pdf_generator.generar_reporte_roster(roster, partido_id)
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=reporte_roster_partido_{partido_id}.pdf"}
        )
        
    except Exception as e:
        logger.error(f"Error generando reporte de roster: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")

@app.get("/api/reports/estadisticas/{jugador_id}")
async def generar_reporte_estadisticas(jugador_id: int):
    """RF-REP-05: Reporte de Estadísticas por Jugador"""
    try:
        logger.info(f"Generando reporte de estadísticas para jugador {jugador_id}")

        # Obtener datos de estadísticas
        estadisticas = execute_query("SELECT * FROM estadisticas WHERE jugadorId = ?", (jugador_id,))

        if not estadisticas:
            logger.warning(f"No se encontraron estadísticas para jugador {jugador_id}")
            estadisticas = []
        
        # Generar PDF
        pdf_content = pdf_generator.generar_reporte_estadisticas(estadisticas, jugador_id)
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=reporte_estadisticas_jugador_{jugador_id}.pdf"}
        )
        
    except Exception as e:
        logger.error(f"Error generando reporte de estadísticas: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
