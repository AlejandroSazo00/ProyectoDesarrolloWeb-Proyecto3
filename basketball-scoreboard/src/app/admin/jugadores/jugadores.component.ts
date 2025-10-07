import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Equipo {
  id: number;
  nombre: string;
  ciudad?: string;
  colorPrimario?: string;
  colorSecundario?: string;
}

interface Jugador {
  id?: number;
  nombre: string;
  numero: number;
  equipoId: number;
  equipo?: Equipo;
  posicion?: string;
  altura?: number;
  peso?: number;
  fechaNacimiento?: string;
  nacionalidad?: string;
  activo: boolean;
}

@Component({
  selector: 'app-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <h1>👥 Gestión de Jugadores</h1>
        <a routerLink="/admin" class="back-btn">← Volver al Panel</a>
      </div>
      
      <div class="admin-content">
        <div class="form-section">
          <h3>{{ editingJugador ? 'Editar Jugador' : 'Crear Nuevo Jugador' }}</h3>
          <form (ngSubmit)="saveJugador()" class="jugador-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre del Jugador *</label>
                <input type="text" [(ngModel)]="currentJugador.nombre" name="nombre" required>
              </div>
              <div class="form-group">
                <label>Número *</label>
                <input type="number" [(ngModel)]="currentJugador.numero" name="numero" min="0" max="99" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Equipo *</label>
                <select [(ngModel)]="currentJugador.equipoId" name="equipoId" required>
                  <option value="">Seleccionar equipo</option>
                  <option *ngFor="let equipo of equipos" [value]="equipo.id">{{ equipo.nombre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Posición</label>
                <select [(ngModel)]="currentJugador.posicion" name="posicion">
                  <option value="">Seleccionar posición</option>
                  <option value="Base">Base (PG)</option>
                  <option value="Escolta">Escolta (SG)</option>
                  <option value="Alero">Alero (SF)</option>
                  <option value="Ala-Pivot">Ala-Pivot (PF)</option>
                  <option value="Pivot">Pivot (C)</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Altura (m)</label>
                <input type="number" [(ngModel)]="currentJugador.altura" name="altura" step="0.01" min="1.50" max="2.50" placeholder="1.85">
              </div>
              <div class="form-group">
                <label>Peso (kg)</label>
                <input type="number" [(ngModel)]="currentJugador.peso" name="peso" min="50" max="200" placeholder="80">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Fecha de Nacimiento</label>
                <input type="date" [(ngModel)]="currentJugador.fechaNacimiento" name="fechaNacimiento">
              </div>
              <div class="form-group">
                <label>Nacionalidad</label>
                <input type="text" [(ngModel)]="currentJugador.nacionalidad" name="nacionalidad" placeholder="México">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="save-btn">{{ editingJugador ? 'Actualizar' : 'Crear' }}</button>
              <button type="button" (click)="cancelEdit()" class="cancel-btn">Cancelar</button>
            </div>
            <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
          </form>
        </div>
        
        <div class="list-section">
          <div class="section-header">
            <h3>Jugadores Registrados ({{ jugadoresFiltrados.length }})</h3>
            <button (click)="refreshJugadores()" class="refresh-btn">🔄 Actualizar</button>
          </div>
          <div class="filter-section">
            <select [(ngModel)]="selectedEquipoFilter" (ngModelChange)="filterByEquipo()" class="filter-select">
              <option value="">Todos los equipos</option>
              <option *ngFor="let equipo of equipos" [value]="equipo.id">{{ equipo.nombre }}</option>
            </select>
          </div>
          <div class="jugadores-grid">
            <div *ngFor="let jugador of jugadoresFiltrados" class="jugador-card">
              <div class="jugador-header" [style.background-color]="jugador.equipo?.colorPrimario || '#3498db'">
                <div class="numero-jersey">#{{ jugador.numero }}</div>
                <h4>{{ jugador.nombre }}</h4>
                <span class="equipo-name">{{ jugador.equipo?.nombre }}</span>
              </div>
              <div class="jugador-body">
                <div class="jugador-info">
                  <div class="info-item" *ngIf="jugador.posicion">
                    <strong>Posición:</strong> {{ jugador.posicion }}
                  </div>
                  <div class="info-item" *ngIf="jugador.altura">
                    <strong>Altura:</strong> {{ jugador.altura }}m
                  </div>
                  <div class="info-item" *ngIf="jugador.peso">
                    <strong>Peso:</strong> {{ jugador.peso }}kg
                  </div>
                  <div class="info-item" *ngIf="jugador.nacionalidad">
                    <strong>Nacionalidad:</strong> {{ jugador.nacionalidad }}
                  </div>
                </div>
                <div class="jugador-actions">
                  <button (click)="editJugador(jugador)" class="edit-btn">Editar</button>
                  <button (click)="deleteJugador(jugador.id!)" class="delete-btn">Eliminar</button>
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
    
    .filter-section {
      margin-bottom: 1rem;
    }
    
    .filter-select {
      max-width: 300px;
    }
    
    .jugadores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }
    
    .jugador-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .jugador-header {
      padding: 1rem;
      color: white;
      text-align: center;
      position: relative;
    }
    
    .numero-jersey {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 1.5rem;
      font-weight: bold;
      opacity: 0.8;
    }
    
    .jugador-header h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
    }
    
    .equipo-name {
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .jugador-body {
      padding: 1rem;
    }
    
    .jugador-info {
      margin-bottom: 1rem;
    }
    
    .info-item {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .jugador-actions {
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
  `]
})
export class JugadoresComponent implements OnInit {
  jugadores: Jugador[] = [];
  jugadoresFiltrados: Jugador[] = [];
  equipos: Equipo[] = [];
  currentJugador: Jugador = { nombre: '', numero: 0, equipoId: 0, activo: true };
  editingJugador = false;
  selectedEquipoFilter = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEquipos();
    this.loadJugadores();
  }

  loadEquipos() {
    this.http.get<Equipo[]>('http://localhost:5163/api/equipos').subscribe({
      next: (equipos) => this.equipos = equipos,
      error: (err) => console.error('Error loading equipos:', err)
    });
  }

  loadJugadores() {
    this.http.get<Jugador[]>('http://localhost:5163/api/jugadores').subscribe({
      next: (jugadores) => {
        this.jugadores = jugadores;
        this.jugadoresFiltrados = jugadores;
      },
      error: (err) => console.error('Error loading jugadores:', err)
    });
  }

  saveJugador() {
    this.errorMessage = '';
    
    // Validaciones básicas
    if (!this.currentJugador.nombre?.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return;
    }
    
    if (!this.currentJugador.numero && this.currentJugador.numero !== 0) {
      this.errorMessage = 'El número es requerido';
      return;
    }
    
    if (this.currentJugador.numero < 0 || this.currentJugador.numero > 99) {
      this.errorMessage = 'El número debe estar entre 0 y 99';
      return;
    }
    
    if (!this.currentJugador.equipoId) {
      this.errorMessage = 'Debe seleccionar un equipo';
      return;
    }
    
    if (this.editingJugador) {
      const updateData = {
        nombre: this.currentJugador.nombre,
        numero: this.currentJugador.numero,
        equipoId: this.currentJugador.equipoId,
        posicion: this.currentJugador.posicion,
        altura: this.currentJugador.altura,
        peso: this.currentJugador.peso,
        fechaNacimiento: this.currentJugador.fechaNacimiento,
        nacionalidad: this.currentJugador.nacionalidad,
        activo: this.currentJugador.activo
      };
      
      this.http.put<Jugador>(`http://localhost:5163/api/jugadores/${this.currentJugador.id}`, updateData).subscribe({
        next: () => {
          this.loadJugadores();
          this.cancelEdit();
        },
        error: (err) => {
          if (err.status === 409) {
            this.errorMessage = 'Ya existe un jugador con ese número en el equipo';
          } else {
            this.errorMessage = 'Error al actualizar jugador: ' + (err.error || err.message);
          }
        }
      });
    } else {
      const createData = {
        nombre: this.currentJugador.nombre,
        numero: this.currentJugador.numero,
        equipoId: this.currentJugador.equipoId,
        posicion: this.currentJugador.posicion,
        altura: this.currentJugador.altura,
        peso: this.currentJugador.peso,
        fechaNacimiento: this.currentJugador.fechaNacimiento,
        nacionalidad: this.currentJugador.nacionalidad
      };
      
      this.http.post<Jugador>('http://localhost:5163/api/jugadores', createData).subscribe({
        next: () => {
          this.loadJugadores();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error completo:', err);
          if (err.status === 409) {
            this.errorMessage = 'Ya existe un jugador con ese número en el equipo seleccionado';
          } else if (err.status === 500) {
            this.errorMessage = 'Error interno del servidor. Verifica que todos los datos sean válidos.';
          } else {
            this.errorMessage = 'Error al crear jugador: ' + (err.error?.message || err.message || 'Error desconocido');
          }
        }
      });
    }
  }

  editJugador(jugador: Jugador) {
    this.currentJugador = { ...jugador };
    if (jugador.fechaNacimiento) {
      this.currentJugador.fechaNacimiento = jugador.fechaNacimiento.split('T')[0];
    }
    this.editingJugador = true;
    this.errorMessage = '';
  }

  deleteJugador(id: number) {
    if (confirm('¿Estás seguro de eliminar este jugador?')) {
      this.http.delete(`http://localhost:5163/api/jugadores/${id}`).subscribe({
        next: () => this.loadJugadores(),
        error: (err) => console.error('Error deleting jugador:', err)
      });
    }
  }

  filterByEquipo() {
    if (this.selectedEquipoFilter) {
      this.jugadoresFiltrados = this.jugadores.filter(j => j.equipoId == +this.selectedEquipoFilter);
    } else {
      this.jugadoresFiltrados = this.jugadores;
    }
  }

  refreshJugadores() {
    this.loadJugadores();
  }

  cancelEdit() {
    this.currentJugador = { nombre: '', numero: 0, equipoId: 0, activo: true };
    this.editingJugador = false;
    this.errorMessage = '';
  }
}
