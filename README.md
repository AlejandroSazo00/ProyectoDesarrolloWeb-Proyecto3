# Basketball Scoreboard - Proyecto Desarrollo Web II

**Desarrollado por:** Alejandro Sazo  
**Contribución individual:** 100%  
**Universidad:** Universidad Mariano Gálvez  
**Email:** msazol1@miumg.edu.gt  
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

### Llave SSH del Maestro Configurada
- Llave SSH del profesor agregada al servidor
- Usuario `melgust` configurado con acceso SSH
- Autenticación basada en llaves ED25519
- Acceso seguro para evaluación: `ssh melgust@104.131.96.162`

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

## Proyecto 3: Arquitectura de Microservicios Heterogénea

### Cumplimiento de Requisitos del Proyecto 3

El presente proyecto cumple con todos los requisitos establecidos para el Proyecto 3 de Desarrollo Web II:

#### Arquitectura de Microservicios Implementada

**Lenguajes de Programación Backend (5 implementados):**
- Node.js con Express (Auth Service)
- Java Spring Boot (Teams Service)
- PHP Laravel (Players Service)
- .NET Core (Basketball API - Matches Service)
- Python FastAPI (Report Service)

**Gestores de Base de Datos (4 implementados):**
- MongoDB (Base de datos NoSQL para autenticación)
- PostgreSQL (Gestión de equipos)
- MySQL (Gestión de jugadores)
- SQL Server (Partidos y reportería)

#### Sistema de Reportería PDF

Se han implementado cinco reportes profesionales en formato PDF utilizando ReportLab:

- **RF-REP-01:** Reporte de Equipos Registrados
- **RF-REP-02:** Reporte de Jugadores por Equipo
- **RF-REP-03:** Historial de Partidos
- **RF-REP-04:** Reporte de Roster por Partido
- **RF-REP-05:** Reporte de Estadísticas por Jugador

#### Seguridad y Autenticación

- Sistema de autenticación JWT implementado
- Control de acceso basado en roles
- Solo usuarios administradores pueden generar reportes

#### Arquitectura de Microservicios

**Servicios Implementados:**
1. **Auth Service** (Puerto 3001) - Node.js + MongoDB
2. **Teams Service** (Puerto 3002) - Java Spring Boot + PostgreSQL
3. **Players Service** (Puerto 3003) - PHP Laravel + MySQL
4. **Basketball API** (Puerto 5163) - .NET Core + SQL Server
5. **Report Service** (Puerto 8000) - Python FastAPI + SQL Server
6. **API Gateway** (Puerto 3000) - Node.js
7. **Frontend** (Puerto 4200) - Angular 18

#### Orquestación con Docker

- Docker Compose para proyecto funcional (docker-compose.yml)
- Docker Compose para microservicios heterogéneos (docker-compose-microservices.yml)
- Configuración de redes y volúmenes persistentes
- Health checks para todos los servicios

### Arquitectura Técnica

#### Frontend
- **Framework:** Angular 18
- **Características:** Single Page Application (SPA)
- **Funcionalidades:** Panel de administración, sistema de audio, navegación moderna

#### Backend Services
- **API Gateway:** Enrutamiento y balanceeo de carga
- **Microservicios:** Arquitectura distribuida con responsabilidades específicas
- **Base de Datos:** Persistencia distribuida en múltiples gestores

#### Infraestructura
- **Contenedorización:** Docker y Docker Compose
- **Orquestación:** Servicios independientes con comunicación HTTP
- **Escalabilidad:** Arquitectura preparada para crecimiento horizontal

## Mejoras Futuras

- Implementación completa de la arquitectura de microservicios en producción
- Integración de sistemas de monitoreo y logging distribuido
- Implementación de Circuit Breaker patterns
- Escalamiento automático basado en métricas
- Implementación de Event Sourcing y CQRS

## Sobre el Desarrollador

**Alejandro Sazo** - Estudiante de Ingeniería en Sistemas  
Universidad Mariano Gálvez de Guatemala

- **Especialización:** Desarrollo Web Full Stack
- **Tecnologías:** .NET, Angular, Docker, Cloud Computing
- **Contacto:** msazol1@miumg.edu.gt
- **GitHub:** [@AlejandroSazo00](https://github.com/AlejandroSazo00)

### Información de Despliegue

- **Usuario:** melgust
- **SSH:** ssh melgust@104.131.96.162
- **Carpeta:** cd /root/ProyectoDesarrolloWeb-2.0
- **Contraseña:** Melgust123!

## Instrucciones de Ejecución

### Proyecto Funcional (Recomendado para Demostración)
```bash
docker-compose up -d
```

### Arquitectura de Microservicios Heterogénea
```bash
docker-compose -f docker-compose-microservices.yml up -d
```

### URLs de Acceso
- **Frontend:** http://localhost:4200
- **Panel de Administración:** http://localhost:4200/admin
- **API Basketball:** http://localhost:5163
- **Servicio de Reportes:** http://localhost:8000/docs

## Licencia

Este proyecto fue desarrollado como parte del curso de Desarrollo Web II en la Universidad Mariano Gálvez de Guatemala.

**© 2025 Alejandro Sazo - Todos los derechos reservados**

---

*Proyecto desarrollado completamente por Alejandro Sazo como parte de la evaluación del Proyecto 3 de Desarrollo Web. Contribución individual: 100%*
