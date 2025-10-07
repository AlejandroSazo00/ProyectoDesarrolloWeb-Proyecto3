import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface DashboardStats {
  totalEquipos: number;
  totalJugadores: number;
  totalPartidos: number;
  partidosFinalizados: number;
  partidosProgramados: number;
  ultimosPartidos: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <h1>📊 Dashboard - Resumen General</h1>
        <a routerLink="/admin" class="back-btn">← Volver al Panel</a>
      </div>
      
      <div class="admin-content">
        <div class="stats-grid">
          <div class="stat-card equipos">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ stats.totalEquipos }}</h3>
              <p>Equipos Registrados</p>
            </div>
            <a routerLink="/admin/equipos" class="stat-link">Ver equipos →</a>
          </div>
          
          <div class="stat-card jugadores">
            <div class="stat-icon">🏃‍♂️</div>
            <div class="stat-content">
              <h3>{{ stats.totalJugadores }}</h3>
              <p>Jugadores Activos</p>
            </div>
            <a routerLink="/admin/jugadores" class="stat-link">Ver jugadores →</a>
          </div>
          
          <div class="stat-card partidos">
            <div class="stat-icon">🏀</div>
            <div class="stat-content">
              <h3>{{ stats.totalPartidos }}</h3>
              <p>Total de Partidos</p>
            </div>
            <a routerLink="/admin/partidos" class="stat-link">Ver partidos →</a>
          </div>
          
          <div class="stat-card finalizados">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <h3>{{ stats.partidosFinalizados }}</h3>
              <p>Partidos Finalizados</p>
            </div>
          </div>
        </div>
        
        <div class="recent-section">
          <h3>🕒 Actividad Reciente</h3>
          <div class="recent-grid">
            <div class="recent-card">
              <h4>Últimos Partidos</h4>
              <div class="recent-list">
                <div *ngFor="let partido of stats.ultimosPartidos" class="recent-item">
                  <div class="teams">{{ partido.equipoLocal }} vs {{ partido.equipoVisitante }}</div>
                  <div class="date">{{ formatDate(partido.fecha) }}</div>
                  <div class="status" [class.finalizado]="partido.marcadorFinalLocal !== null">
                    {{ partido.marcadorFinalLocal !== null ? 'Finalizado' : 'Programado' }}
                  </div>
                </div>
                <div *ngIf="stats.ultimosPartidos.length === 0" class="no-data">
                  No hay partidos registrados
                </div>
              </div>
            </div>
            
            <div class="recent-card">
              <h4>Accesos Rápidos</h4>
              <div class="quick-actions">
                <a routerLink="/admin/equipos" class="quick-btn equipos-btn">
                  <span class="icon">👥</span>
                  <span class="text">Crear Equipo</span>
                </a>
                <a routerLink="/admin/jugadores" class="quick-btn jugadores-btn">
                  <span class="icon">🏃‍♂️</span>
                  <span class="text">Agregar Jugador</span>
                </a>
                <a routerLink="/admin/partidos" class="quick-btn partidos-btn">
                  <span class="icon">🏀</span>
                  <span class="text">Nuevo Partido</span>
                </a>
                <a routerLink="/" class="quick-btn marcador-btn">
                  <span class="icon">📺</span>
                  <span class="text">Ver Marcador</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="system-info">
          <h3>ℹ️ Información del Sistema</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>Estado del Sistema:</strong> 
              <span class="status-online">🟢 En línea</span>
            </div>
            <div class="info-item">
              <strong>Última actualización:</strong> 
              <span>{{ getCurrentTime() }}</span>
            </div>
            <div class="info-item">
              <strong>Versión:</strong> 
              <span>Basketball Scoreboard v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      min-height: 100vh;
      background: #f5f5f5;
    }
    
    .admin-header {
      background: #2c3e50;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .back-btn {
      background: #34495e;
      color: white;
      padding: 0.5rem 1rem;
      text-decoration: none;
      border-radius: 4px;
    }
    
    .admin-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .stat-card.equipos { border-left: 4px solid #3498db; }
    .stat-card.jugadores { border-left: 4px solid #27ae60; }
    .stat-card.partidos { border-left: 4px solid #e67e22; }
    .stat-card.finalizados { border-left: 4px solid #9b59b6; }
    
    .stat-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    .stat-content h3 {
      font-size: 2.5rem;
      margin: 0;
      color: #2c3e50;
    }
    
    .stat-content p {
      margin: 0.5rem 0 0 0;
      color: #7f8c8d;
      font-weight: 600;
    }
    
    .stat-link {
      margin-top: 1rem;
      color: #3498db;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    .recent-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .recent-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-top: 1rem;
    }
    
    .recent-card h4 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
    }
    
    .recent-item {
      padding: 0.75rem;
      border: 1px solid #ecf0f1;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    
    .teams {
      font-weight: 600;
      color: #2c3e50;
    }
    
    .date {
      font-size: 0.8rem;
      color: #7f8c8d;
    }
    
    .status {
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      border-radius: 10px;
      background: #f39c12;
      color: white;
      display: inline-block;
      margin-top: 0.5rem;
    }
    
    .status.finalizado {
      background: #27ae60;
    }
    
    .no-data {
      color: #95a5a6;
      font-style: italic;
      text-align: center;
      padding: 2rem;
    }
    
    .quick-actions {
      display: grid;
      gap: 0.5rem;
    }
    
    .quick-btn {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border-radius: 4px;
      text-decoration: none;
      color: white;
      font-weight: 600;
      transition: transform 0.2s;
    }
    
    .quick-btn:hover {
      transform: translateY(-2px);
    }
    
    .quick-btn .icon {
      margin-right: 0.75rem;
      font-size: 1.2rem;
    }
    
    .equipos-btn { background: #3498db; }
    .jugadores-btn { background: #27ae60; }
    .partidos-btn { background: #e67e22; }
    .marcador-btn { background: #9b59b6; }
    
    .system-info {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .info-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #ecf0f1;
    }
    
    .status-online {
      color: #27ae60;
      font-weight: 600;
    }
    
    @media (max-width: 768px) {
      .recent-grid {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalEquipos: 0,
    totalJugadores: 0,
    totalPartidos: 0,
    partidosFinalizados: 0,
    partidosProgramados: 0,
    ultimosPartidos: []
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // Cargar estadísticas de equipos
    this.http.get<any[]>('http://localhost:5163/api/equipos').subscribe({
      next: (equipos) => this.stats.totalEquipos = equipos.length,
      error: (err) => console.error('Error loading equipos stats:', err)
    });

    // Cargar estadísticas de jugadores
    this.http.get<any[]>('http://localhost:5163/api/jugadores').subscribe({
      next: (jugadores) => this.stats.totalJugadores = jugadores.length,
      error: (err) => console.error('Error loading jugadores stats:', err)
    });

    // Cargar estadísticas de partidos
    this.http.get<any>('http://localhost:5163/api/admin/partidos').subscribe({
      next: (response) => {
        const partidos = response.partidos || response || [];
        this.stats.totalPartidos = partidos.length;
        this.stats.partidosFinalizados = partidos.filter((p: any) => p.marcadorFinalLocal !== null).length;
        this.stats.partidosProgramados = partidos.filter((p: any) => p.marcadorFinalLocal === null).length;
        this.stats.ultimosPartidos = partidos.slice(-5).reverse(); // Últimos 5 partidos
      },
      error: (err) => console.error('Error loading partidos stats:', err)
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getCurrentTime(): string {
    return new Date().toLocaleString();
  }
}
