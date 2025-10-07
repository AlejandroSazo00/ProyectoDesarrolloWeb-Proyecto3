import requests
import logging
from datetime import datetime

# Configurar logging para debug
logging.basicConfig(level=logging.INFO)

# Configuración de base de datos
DATABASE_CONFIG = {
    "server": os.getenv("DB_SERVER", "localhost"),
    "database": os.getenv("DB_NAME", "BasketballScoreboardDB"),
    "username": os.getenv("DB_USER", "sa"),
    "password": os.getenv("DB_PASSWORD", "YourStrong@Passw0rd"),
    "port": int(os.getenv("DB_PORT", "1433"))
}

def get_connection():
    """Obtener conexión a la base de datos"""
    try:
        # Aquí iría la conexión real a SQL Server
        # Por ahora simulamos la conexión
        logging.info("Conexión a base de datos simulada")
        return None
    except Exception as e:
        logging.error(f"Error conectando a la base de datos: {e}")
        raise

def execute_query(query: str, params: tuple = None):
    """Ejecutar consulta obteniendo datos de la API .NET"""
    try:
        # Conectar a la API .NET para obtener datos reales
        base_url = "http://basketball-api:8080/api"  # URL interna de Docker
        
        # Para desarrollo local, usar localhost
        try:
            import socket
            socket.create_connection(("basketball-api", 8080), timeout=1)
        except:
            base_url = "http://localhost:5163/api"  # Fallback a localhost
        
        if "equipos" in query.lower():
            response = requests.get(f"{base_url}/equipos", timeout=10)
            if response.status_code == 200:
                equipos = response.json()
                # Convertir formato para compatibilidad
                result = []
                for equipo in equipos:
                    from datetime import datetime
                    result.append({
                        "Id": equipo.get("id"),
                        "Nombre": equipo.get("nombre"),
                        "Ciudad": equipo.get("ciudad"),
                        "LogoUrl": equipo.get("logoUrl"),
                        "ColorPrimario": equipo.get("colorPrimario"),
                        "ColorSecundario": equipo.get("colorSecundario"),
                        "CreatedAt": datetime.now(),  # Fecha actual si no existe
                        "Activo": True
                    })
                return result
            else:
                logging.warning(f"Error obteniendo equipos: {response.status_code}")
                
        elif "jugadores" in query.lower():
            # Obtener jugadores del equipo específico
            equipo_id = params[0] if params else 1
            response = requests.get(f"{base_url}/jugadores", timeout=10)
            if response.status_code == 200:
                jugadores = response.json()
                # Filtrar por equipo si es necesario
                result = []
                
                for jugador in jugadores:
                    if jugador.get("equipoId") == int(equipo_id):
                        # Obtener el nombre del jugador
                        nombre = jugador.get("nombre", "").strip()
                        if not nombre:
                            nombre = f"Jugador #{jugador.get('id', 'N/A')}"
                        
                        result.append({
                            "Id": jugador.get("id"),
                            "NombreCompleto": nombre,
                            "Numero": jugador.get("numero"),
                            "Posicion": jugador.get("posicion"),
                            "Edad": jugador.get("edad"),
                            "Estatura": jugador.get("altura"),
                            "Nacionalidad": jugador.get("nacionalidad"),
                            "EquipoNombre": jugador.get("equipoNombre", "N/A")
                        })
                return result
                
        elif "partidos" in query.lower():
            response = requests.get(f"{base_url}/partidos", timeout=10)
            if response.status_code == 200:
                partidos = response.json()
                result = []
                for partido in partidos:
                    from datetime import datetime
                    result.append({
                        "Id": partido.get("id"),
                        "EquipoLocal": partido.get("equipoLocal"),
                        "EquipoVisitante": partido.get("equipoVisitante"),
                        "Fecha": datetime.now(),  # Parsear fecha si existe
                        "MarcadorFinalLocal": partido.get("marcadorFinalLocal"),
                        "MarcadorFinalVisitante": partido.get("marcadorFinalVisitante"),
                        "EquipoLocalNombre": partido.get("equipoLocal"),
                        "EquipoVisitanteNombre": partido.get("equipoVisitante")
                    })
                return result
                
        elif "roster" in query.lower():
            # Para roster, obtener jugadores del partido específico
            partido_id = params[0] if params else 1
            
            # Primero obtener el partido para saber los equipos
            response_partido = requests.get(f"{base_url}/partidos/{partido_id}", timeout=10)
            if response_partido.status_code == 200:
                partido = response_partido.json()
                
                # Obtener información de los equipos
                response_equipos = requests.get(f"{base_url}/equipos", timeout=10)
                equipos_dict = {}
                if response_equipos.status_code == 200:
                    equipos = response_equipos.json()
                    for equipo in equipos:
                        equipos_dict[equipo.get("id")] = equipo.get("nombre", f"Equipo #{equipo.get('id')}")
                
                # Obtener jugadores de ambos equipos
                response_jugadores = requests.get(f"{base_url}/jugadores", timeout=10)
                if response_jugadores.status_code == 200:
                    jugadores = response_jugadores.json()
                    result = []
                    
                    # Filtrar jugadores de los equipos del partido
                    equipo_local_id = partido.get("equipoLocalId")
                    equipo_visitante_id = partido.get("equipoVisitanteId")
                    
                    for jugador in jugadores:
                        if jugador.get("equipoId") in [equipo_local_id, equipo_visitante_id]:
                            equipo_id = jugador.get("equipoId")
                            equipo_nombre = equipos_dict.get(equipo_id, f"Equipo #{equipo_id}")
                            
                            # Obtener el nombre del jugador
                            nombre = jugador.get("nombre", "").strip()
                            if not nombre:
                                nombre = f"Jugador #{jugador.get('id', 'N/A')}"
                            
                            # Intentar diferentes campos para la posición
                            posicion = (jugador.get("posicion") or 
                                      jugador.get("Posicion") or 
                                      jugador.get("position") or 
                                      "N/A")
                            
                            result.append({
                                "Id": jugador.get("id"),
                                "NombreCompleto": nombre,
                                "Numero": jugador.get("numero") or jugador.get("Numero") or "N/A",
                                "Posicion": posicion,
                                "EquipoId": equipo_id,
                                "EquipoNombre": equipo_nombre
                            })
                    return result
            
            # Si no se puede obtener el partido específico, intentar obtener todos los jugadores
            try:
                response_equipos = requests.get(f"{base_url}/equipos", timeout=10)
                response_jugadores = requests.get(f"{base_url}/jugadores", timeout=10)
                
                equipos_dict = {}
                if response_equipos.status_code == 200:
                    equipos = response_equipos.json()
                    for equipo in equipos:
                        equipos_dict[equipo.get("id")] = equipo.get("nombre", f"Equipo #{equipo.get('id')}")
                
                if response_jugadores.status_code == 200:
                    jugadores = response_jugadores.json()
                    result = []
                    
                    
                    for jugador in jugadores:
                        equipo_id = jugador.get("equipoId")
                        equipo_nombre = equipos_dict.get(equipo_id, f"Equipo #{equipo_id}")
                        
                        # Obtener el nombre del jugador
                        nombre = jugador.get("nombre", "").strip()
                        if not nombre:
                            nombre = f"Jugador #{jugador.get('id', 'N/A')}"
                        
                        # Intentar diferentes campos para la posición
                        posicion = (jugador.get("posicion") or 
                                  jugador.get("Posicion") or 
                                  jugador.get("position") or 
                                  "N/A")
                        
                        result.append({
                            "Id": jugador.get("id"),
                            "NombreCompleto": nombre,
                            "Numero": jugador.get("numero") or jugador.get("Numero") or "N/A",
                            "Posicion": posicion,
                            "EquipoId": equipo_id,
                            "EquipoNombre": equipo_nombre
                        })
                    return result
            except Exception as e:
                logging.error(f"Error obteniendo roster real: {e}")
            
            # Solo si hay error total, retornar lista vacía
            return []
            
        elif "estadisticas" in query.lower():
            # Para estadísticas, obtener datos del jugador específico
            jugador_id = params[0] if params else 1
            
            # Obtener información del jugador
            response_jugador = requests.get(f"{base_url}/jugadores/{jugador_id}", timeout=10)
            if response_jugador.status_code == 200:
                jugador = response_jugador.json()
                
                # Generar estadísticas simuladas basadas en el jugador
                return [
                    {
                        "JugadorId": jugador_id,
                        "NombreJugador": jugador.get("nombreCompleto", f"Jugador #{jugador_id}"),
                        "PartidosJugados": 5,
                        "PuntosPromedio": 15.2,
                        "RebotesPromedio": 6.8,
                        "AsistenciasPromedio": 4.1,
                        "MinutosJugados": 28.5,
                        "PorcentajeTiros": 45.6
                    }
                ]
            else:
                # Estadísticas simuladas si no se encuentra el jugador
                return [
                    {
                        "JugadorId": jugador_id,
                        "NombreJugador": f"Jugador #{jugador_id}",
                        "PartidosJugados": 3,
                        "PuntosPromedio": 12.0,
                        "RebotesPromedio": 5.0,
                        "AsistenciasPromedio": 3.0,
                        "MinutosJugados": 25.0,
                        "PorcentajeTiros": 42.0
                    }
                ]
        
        # Si no se puede conectar, usar datos de respaldo
        logging.warning("No se pudo conectar a la API, usando datos de respaldo")
        return []
        
    except Exception as e:
        logging.error(f"Error conectando a la API: {e}")
        # Datos de respaldo en caso de error
        return []

# Consultas SQL predefinidas
QUERIES = {
    "equipos": """
        SELECT Id, Nombre, Ciudad, LogoUrl, ColorPrimario, ColorSecundario, 
               CreatedAt, Activo
        FROM Equipos 
        WHERE Activo = 1
        ORDER BY Nombre
    """,
    "jugadores": """
        SELECT j.Id, j.NombreCompleto, j.Numero, j.Posicion, j.Edad, 
               j.Estatura, j.Nacionalidad, e.Nombre as EquipoNombre
        FROM Jugadores j
        INNER JOIN Equipos e ON j.EquipoId = e.Id
        WHERE j.Activo = 1 AND j.EquipoId = ?
        ORDER BY j.Numero
    """,
    "partidos": """
        SELECT p.Id, el.Nombre as EquipoLocal, ev.Nombre as EquipoVisitante,
               p.Fecha, p.MarcadorFinalLocal, p.MarcadorFinalVisitante
        FROM Partidos p
        INNER JOIN Equipos el ON p.EquipoLocalId = el.Id
        INNER JOIN Equipos ev ON p.EquipoVisitanteId = ev.Id
        ORDER BY p.Fecha DESC
    """
}
