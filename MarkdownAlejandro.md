# Basketball Scoreboard - Proyecto Desarrollo Web II

## Manuel Alejandro Sazo Linares
## 7690-20-13585
## msazol1@miumg.edu.gt

**Universidad:** Universidad Mariano Gálvez  
**Contribución individual:** 100%  
**GitHub:** [@AlejandroSazo00](https://github.com/AlejandroSazo00)

## Descripción del Proyecto

Sistema completo de marcador de baloncesto con panel administrativo desarrollado con .NET Core Web API y Angular. El proyecto cumple con todos los requerimientos del Proyecto II de Desarrollo Web, implementando autenticación JWT, CRUD completo y despliegue en VPS.

## Aplicación en Vivo

- **Aplicación Principal:** http://104.131.96.162:4200
- **API Backend:** http://104.131.96.162:5000
- **Documentación API:** http://104.131.96.162:5000/swagger
- **Login Admin:** `admin` / `Admin123!`

## Funcionalidades Implementadas

### Marcador Público
- Marcador en tiempo real con botones +1, +2, +3 puntos
- Sistema de cuartos automático (4 cuartos de 10 minutos)
- Timer funcional con control de tiempo
- Registro de faltas por equipo
- Efectos de sonido y música de fondo
- Interfaz responsive y moderna

### Sistema de Autenticación
- Login seguro con JWT (JSON Web Tokens)
- Autorización por roles (Admin)
- Gestión de sesiones (login, logout, expiración)
- Guards de autenticación en rutas protegidas
- Interceptors automáticos para Bearer tokens

### Gestión de Equipos
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Campos: nombre, ciudad, logo
- Lista con búsqueda y filtrado
- Validaciones en tiempo real
- Interfaz intuitiva y moderna

### Gestión de Jugadores
- CRUD completo con validaciones
- Campos: nombre completo, número, posición, estatura, edad, nacionalidad
- Asociación con equipos
- Filtrado por equipo
- Validaciones de duplicados y campos requeridos

### Gestión de Partidos
- CRUD completo de partidos
- Selección de equipos participantes
- Programación de fecha/hora
- **Funcionalidad "Finalizar Partido"** - Implementada completamente
- Historial de partidos con marcadores finales
- Integración directa con el marcador público

## Tecnologías Utilizadas

### Backend (.NET Core 8.0)
- **Framework:** ASP.NET Core Web API
- **Base de Datos:** SQLite (Producción) / SQL Server (Desarrollo)
- **ORM:** Entity Framework Core
- **Autenticación:** JWT Bearer Tokens
- **Documentación:** Swagger/OpenAPI
- **Validaciones:** Data Annotations + FluentValidation

### Frontend (Angular 17)
- **Framework:** Angular con TypeScript
- **Routing:** Angular Router con Guards
- **HTTP:** HttpClient con Interceptors
- **UI/UX:** CSS3 + Bootstrap responsive
- **Validaciones:** Reactive Forms

### DevOps y Despliegue
- **Contenedores:** Docker + Docker Compose
- **VPS:** DigitalOcean Ubuntu 22.04
- **Servidor Web:** Nginx (reverse proxy)
- **CI/CD:** GitHub Actions ready
- **Monitoreo:** Docker health checks

## Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular SPA   │────│  .NET Core API  │────│   SQLite DB     │
│   (Frontend)    │    │   (Backend)     │    │  (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│  JWT Auth       │──────────────┘
                        │  + CORS         │
                        └─────────────────┘
```

## Cumplimiento de Requerimientos

### Requerimientos Funcionales (11/12 - 92%)
- **RF-ADM-01:** Login seguro para administradores
- **RF-ADM-02:** Acceso protegido al panel administrativo
- **RF-ADM-03:** Gestión completa de sesiones
- **RF-ADM-04:** Crear equipos (nombre, ciudad, logo)
- **RF-ADM-05:** Editar/eliminar equipos
- **RF-ADM-06:** Lista equipos con búsqueda/filtrado
- **RF-ADM-07:** Registrar jugadores con todos los campos
- **RF-ADM-08:** Editar/eliminar jugadores
- **RF-ADM-09:** Listar jugadores por equipo
- **RF-ADM-10:** Crear partidos con equipos y fecha/hora
- **RF-ADM-11:** Asignar roster por partido (mejora futura)
- **RF-ADM-12:** Historial partidos con marcadores finales

### Requerimientos No Funcionales (100%)
- **RNF-ADM-01:** Contraseñas hasheadas (BCrypt)
- **RNF-ADM-02:** Rutas protegidas con JWT
- **RNF-ADM-03:** Interfaz clara y estructurada
- **RNF-ADM-04:** Validaciones en tiempo real
- **RNF-ADM-05:** Gestión eficiente de datos
- **RNF-ADM-06:** Soporte múltiples usuarios simultáneos

## Instalación y Despliegue

### Prerrequisitos
- Docker & Docker Compose
- .NET 8.0 SDK (desarrollo)
- Node.js 18+ (desarrollo)
- Angular CLI (desarrollo)

### Despliegue con Docker (Recomendado)
```bash
# Clonar repositorio
git clone https://github.com/AlejandroSazo00/ProyectoDesarrolloWeb-2.0.git
cd ProyectoDesarrolloWeb-2.0

# Construir y ejecutar
docker-compose up -d --build

# Verificar estado
docker-compose ps
```

### Desarrollo Local
```bash
# Backend
cd BasketballScoreboardAPI
dotnet restore
dotnet run

# Frontend (nueva terminal)
cd basketball-scoreboard
npm install
ng serve
```

## Configuración de Seguridad

### Acceso SSH para Evaluación
- Usuario principal: `root@104.131.96.162` (llave SSH)
- Usuario para evaluación: `melgust@104.131.96.162`
- Contraseña del evaluador: `Melgust123!`
- Autenticación basada en llaves ED25519

### JWT Configuration
```json
{
  "JwtSettings": {
    "SecretKey": "[SECURE_KEY]",
    "Issuer": "BasketballScoreboardAPI",
    "Audience": "BasketballScoreboardApp",
    "ExpirationHours": 24
  }
}
```

## Funcionalidades Destacadas

### Finalizar Partido (Recién Implementado)
```typescript
finalizarPartido(partido: Partido) {
  const marcadorLocal = prompt('Marcador final equipo local:');
  const marcadorVisitante = prompt('Marcador final equipo visitante:');
  
  if (marcadorLocal && marcadorVisitante) {
    const finalData = {
      marcadorFinalLocal: parseInt(marcadorLocal),
      marcadorFinalVisitante: parseInt(marcadorVisitante)
    };
    
    this.http.post(`${API_URL}/api/admin/partidos/${partido.id}/finalizar`, finalData)
      .subscribe({
        next: () => this.loadPartidos(),
        error: (err) => console.error('Error:', err)
      });
  }
}
```

### Integración Marcador-Admin
- Navegación segura desde admin al marcador
- Parámetros de partido automáticos
- Preservación del marcador original
- Base de datos compartida

## Comandos de Administración del Servidor

### Iniciar Aplicación
```bash
# Conectar al servidor
ssh root@104.131.96.162

# Ir al directorio del proyecto
cd /root/ProyectoDesarrolloWeb-2.0

# Iniciar contenedores
docker-compose up -d --build

# Verificar estado
docker-compose ps
```

### Detener Aplicación
```bash
# Detener contenedores
docker-compose down

# Apagar servidor (opcional)
sudo shutdown -h now
```

## Métricas del Proyecto

- **Archivos de código:** 50+
- **Endpoints API:** 25+
- **Componentes Angular:** 15+
- **Rutas protegidas:** 8
- **Modelos de datos:** 5
- **Validaciones:** 30+
- **Tiempo desarrollo:** 40+ horas

## Logros Técnicos

1. **Arquitectura Limpia:** Separación clara entre capas
2. **Seguridad Robusta:** JWT + Guards + Interceptors
3. **UI/UX Moderna:** Interfaz responsive y intuitiva
4. **Despliegue Profesional:** Docker + VPS + CI/CD ready
5. **Código Mantenible:** Principios SOLID aplicados
6. **Documentación Completa:** Swagger + README detallado

## Mejoras Futuras

- **Roster Management:** Asignación de jugadores por partido
- **Estadísticas Avanzadas:** Gráficos y reportes
- **Notificaciones:** WebSockets para tiempo real
- **Mobile App:** Aplicación móvil nativa
- **Analytics:** Dashboard de métricas avanzadas

## Licencia

Este proyecto fue desarrollado como parte del curso de Desarrollo Web II en la Universidad Mariano Gálvez de Guatemala.

**© 2025 Manuel Alejandro Sazo Linares - Todos los derechos reservados**

---

*Proyecto desarrollado completamente por Manuel Alejandro Sazo Linares como parte de la evaluación del Proyecto II de Desarrollo Web. Contribución individual: 100%*
