import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Equipo {
  id: number;
  nombre: string;
  ciudad?: string;
  colorPrimario?: string;
  colorSecundario?: string;
}

interface Partido {
  id?: number;
  equipoLocal: string;
  equipoVisitante: string;
  equipoLocalId?: number;
  equipoVisitanteId?: number;
  puntosLocal: number;
  puntosVisitante: number;
  marcadorFinalLocal?: number;
  marcadorFinalVisitante?: number;
  cuartoActual: number;
  tiempoRestante: number;
  fecha: string;
}

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <h1>🏀 Gestión de Partidos</h1>
        <a routerLink="/admin" class="back-btn">← Volver al Panel</a>
      </div>
      
      <div class="admin-content">
        <div class="form-section">
          <h3>{{ editingPartido ? 'Editar Partido' : 'Crear Nuevo Partido' }}</h3>
          <form (ngSubmit)="savePartido()" class="partido-form">
            <div class="form-row">
              <div class="form-group">
                <label>Equipo Local *</label>
                <select [(ngModel)]="currentPartido.equipoLocalId" name="equipoLocalId" required (ngModelChange)="onEquipoLocalChange()">
                  <option value="">Seleccionar equipo local</option>
                  <option *ngFor="let equipo of equipos" [value]="equipo.id">{{ equipo.nombre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Equipo Visitante *</label>
                <select [(ngModel)]="currentPartido.equipoVisitanteId" name="equipoVisitanteId" required (ngModelChange)="onEquipoVisitanteChange()">
                  <option value="">Seleccionar equipo visitante</option>
                  <option *ngFor="let equipo of equipos" [value]="equipo.id">{{ equipo.nombre }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Fecha y Hora</label>
                <input type="datetime-local" [(ngModel)]="currentPartido.fecha" name="fecha">
              </div>
              <div class="form-group" *ngIf="editingPartido">
                <label>Estado</label>
                <span class="status-badge" [class.finalizado]="currentPartido.marcadorFinalLocal !== undefined">
                  {{ currentPartido.marcadorFinalLocal !== undefined ? 'Finalizado' : 'Programado' }}
                </span>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="save-btn">{{ editingPartido ? 'Actualizar' : 'Crear' }}</button>
              <button type="button" (click)="cancelEdit()" class="cancel-btn">Cancelar</button>
            </div>
            <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
          </form>
        </div>
        
        <div class="list-section">
          <div class="section-header">
            <h3>Partidos Registrados ({{ partidos.length }})</h3>
            <button (click)="refreshPartidos()" class="refresh-btn">🔄 Actualizar</button>
          </div>
          <div class="partidos-grid">
            <div *ngFor="let partido of partidos" class="partido-card">
              <div class="partido-header">
                <div class="teams">
                  <div class="team local">
                    <h4>{{ partido.equipoLocal }}</h4>
                    <div class="score">{{ partido.marcadorFinalLocal ?? partido.puntosLocal }}</div>
                  </div>
                  <div class="vs">VS</div>
                  <div class="team visitante">
                    <h4>{{ partido.equipoVisitante }}</h4>
                    <div class="score">{{ partido.marcadorFinalVisitante ?? partido.puntosVisitante }}</div>
                  </div>
                </div>
                <div class="partido-status">
                  <span class="status-badge" [class.finalizado]="partido.marcadorFinalLocal !== undefined">
                    {{ partido.marcadorFinalLocal !== undefined ? 'Finalizado' : 'Programado' }}
                  </span>
                </div>
              </div>
              <div class="partido-body">
                <div class="partido-info">
                  <div class="info-item">
                    <strong>Fecha:</strong> {{ formatDate(partido.fecha) }}
                  </div>
                  <div class="info-item" *ngIf="partido.marcadorFinalLocal !== undefined">
                    <strong>Resultado Final:</strong> {{ partido.marcadorFinalLocal }} - {{ partido.marcadorFinalVisitante }}
                  </div>
                </div>
                <div class="partido-actions">
                  <button (click)="editPartido(partido)" class="edit-btn">Editar</button>
                  <button (click)="iniciarMarcador(partido)" class="play-btn" *ngIf="!partido.marcadorFinalLocal && !partido.marcadorFinalVisitante">
                    🏀 Iniciar Marcador
                  </button>
		  <button (click)="finalizarPartido(partido)" class="finish-btn" *ngIf="!partido.marcadorFinalLocal && !partido.marcadorFinalVisitante">
                    🏁 Finalizar
                  </button>
                  <button (click)="deletePartido(partido.id!)" class="delete-btn">Eliminar</button>
                </div>
              </div>
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
    
    .form-section, .list-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }
    
    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .save-btn {
      background: #27ae60;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .cancel-btn {
      background: #95a5a6;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .refresh-btn {
      background: #17a2b8;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .partidos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1rem;
    }
    
    .partido-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .partido-header {
      background: #f8f9fa;
      padding: 1rem;
    }
    
    .teams {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .team {
      text-align: center;
      flex: 1;
    }
    
    .team h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }
    
    .score {
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
    }
    
    .vs {
      font-weight: bold;
      color: #7f8c8d;
      margin: 0 1rem;
    }
    
    .partido-status {
      text-align: center;
    }
    
    .status-badge {
      background: #f39c12;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .status-badge.finalizado {
      background: #27ae60;
    }
    
    .partido-body {
      padding: 1rem;
    }
    
    .partido-info {
      margin-bottom: 1rem;
    }
    
    .info-item {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .partido-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .edit-btn {
      background: #3498db;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      flex: 1;
    }
    
    .play-btn {
      background: #e67e22;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      flex: 1;
      font-weight: 600;
    }
    
    .delete-btn {
      background: #e74c3c;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      flex: 1;
    }
    
    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      border-left: 4px solid #c62828;
    }
  `]
})
export class PartidosComponent implements OnInit {
  partidos: Partido[] = [];
  equipos: Equipo[] = [];
  currentPartido: Partido = {
    equipoLocal: '',
    equipoVisitante: '',
    puntosLocal: 0,
    puntosVisitante: 0,
    cuartoActual: 1,
    tiempoRestante: 600,
    fecha: new Date().toISOString().slice(0, 16)
  };
  editingPartido = false;
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadEquipos();
    this.loadPartidos();
  }

  loadEquipos() {
    this.http.get<Equipo[]>('http://104.131.96.162:5163/api/equipos').subscribe({
      next: (equipos) => this.equipos = equipos,
      error: (err) => console.error('Error loading equipos:', err)
    });
  }

  loadPartidos() {
    this.http.get<any>('http://104.131.96.162:5163/api/admin/partidos').subscribe({
      next: (response) => this.partidos = response.partidos || response,
      error: (err) => console.error('Error loading partidos:', err)
    });
  }

  onEquipoLocalChange() {
    const equipo = this.equipos.find(e => e.id == this.currentPartido.equipoLocalId);
    if (equipo) {
      this.currentPartido.equipoLocal = equipo.nombre;
    }
  }

  onEquipoVisitanteChange() {
    const equipo = this.equipos.find(e => e.id == this.currentPartido.equipoVisitanteId);
    if (equipo) {
      this.currentPartido.equipoVisitante = equipo.nombre;
    }
  }

  savePartido() {
    this.errorMessage = '';
    
    if (!this.currentPartido.equipoLocalId || !this.currentPartido.equipoVisitanteId) {
      this.errorMessage = 'Debe seleccionar ambos equipos';
      return;
    }

    if (this.currentPartido.equipoLocalId === this.currentPartido.equipoVisitanteId) {
      this.errorMessage = 'Los equipos deben ser diferentes';
      return;
    }

    if (this.editingPartido) {
      const updateData = {
        equipoLocal: this.currentPartido.equipoLocal,
        equipoVisitante: this.currentPartido.equipoVisitante,
        equipoLocalId: this.currentPartido.equipoLocalId,
        equipoVisitanteId: this.currentPartido.equipoVisitanteId,
        fecha: this.currentPartido.fecha
      };
      
      this.http.put<Partido>(`http://104.131.96.162:5163/api/admin/partidos/${this.currentPartido.id}`, updateData).subscribe({
        next: () => {
          this.loadPartidos();
          this.cancelEdit();
        },
        error: (err) => {
          this.errorMessage = 'Error al actualizar partido: ' + (err.error?.message || err.message);
        }
      });
    } else {
      const createData = {
        equipoLocal: this.currentPartido.equipoLocal,
        equipoVisitante: this.currentPartido.equipoVisitante,
        equipoLocalId: this.currentPartido.equipoLocalId,
        equipoVisitanteId: this.currentPartido.equipoVisitanteId,
        fecha: this.currentPartido.fecha
      };
      
      this.http.post<Partido>('http://104.131.96.162:5163/api/admin/partidos', createData).subscribe({
        next: () => {
          this.loadPartidos();
          this.cancelEdit();
        },
        error: (err) => {
          this.errorMessage = 'Error al crear partido: ' + (err.error?.message || err.message);
        }
      });
    }
  }

  editPartido(partido: Partido) {
    this.currentPartido = { ...partido };
    if (partido.fecha) {
      this.currentPartido.fecha = new Date(partido.fecha).toISOString().slice(0, 16);
    }
    this.editingPartido = true;
    this.errorMessage = '';
  }

  deletePartido(id: number) {
    if (confirm('¿Estás seguro de eliminar este partido?')) {
      this.http.delete(`http://104.131.96.162:5163/api/admin/partidos/${id}`).subscribe({
        next: () => this.loadPartidos(),
        error: (err) => console.error('Error deleting partido:', err)
      });
    }
  }

  iniciarMarcador(partido: Partido) {
    // INTEGRACIÓN SEGURA: Navegar al marcador con parámetros
    this.router.navigate(['/'], {
      queryParams: {
        equipoLocal: partido.equipoLocal,
        equipoVisitante: partido.equipoVisitante,
        partidoId: partido.id
      }
    });
  }

  refreshPartidos() {
    this.loadPartidos();
  }
  
  finalizarPartido(partido: Partido) {
    const marcadorLocal = prompt('Marcador final equipo local:');
    const marcadorVisitante = prompt('Marcador final equipo visitante:');
    
    if (marcadorLocal && marcadorVisitante) {
      const finalData = {
        marcadorFinalLocal: parseInt(marcadorLocal),
        marcadorFinalVisitante: parseInt(marcadorVisitante)
      };
      
      this.http.post(`http://104.131.96.162:5163/api/admin/partidos/${partido.id}/finalizar`, finalData).subscribe({
        next: () => this.loadPartidos(),
        error: (err) => console.error('Error finalizando partido:', err)
      });
    }
  }

  cancelEdit() {
    this.currentPartido = {
      equipoLocal: '',
      equipoVisitante: '',
      puntosLocal: 0,
      puntosVisitante: 0,
      cuartoActual: 1,
      tiempoRestante: 600,
      fecha: new Date().toISOString().slice(0, 16)
    };
    this.editingPartido = false;
    this.errorMessage = '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}

