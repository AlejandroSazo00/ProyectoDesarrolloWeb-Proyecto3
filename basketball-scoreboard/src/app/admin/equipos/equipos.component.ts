import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Equipo {
  id?: number;
  nombre: string;
  ciudad?: string;
  logoUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  activo: boolean;
}

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <h1>🏆 Gestión de Equipos</h1>
        <a routerLink="/admin" class="back-btn">← Volver al Panel</a>
      </div>
      
      <div class="admin-content">
        <div class="form-section">
          <h3>{{ editingEquipo ? 'Editar Equipo' : 'Crear Nuevo Equipo' }}</h3>
          <form (ngSubmit)="saveEquipo()" class="equipo-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre del Equipo *</label>
                <input type="text" [(ngModel)]="currentEquipo.nombre" name="nombre" required>
              </div>
              <div class="form-group">
                <label>Ciudad</label>
                <input type="text" [(ngModel)]="currentEquipo.ciudad" name="ciudad">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Color Primario</label>
                <input type="color" [(ngModel)]="currentEquipo.colorPrimario" name="colorPrimario">
              </div>
              <div class="form-group">
                <label>Color Secundario</label>
                <input type="color" [(ngModel)]="currentEquipo.colorSecundario" name="colorSecundario">
              </div>
            </div>
            <div class="form-group">
              <label>URL del Logo</label>
              <input type="url" [(ngModel)]="currentEquipo.logoUrl" name="logoUrl" placeholder="https://...">
            </div>
            <div class="form-actions">
              <button type="submit" class="save-btn">{{ editingEquipo ? 'Actualizar' : 'Crear' }}</button>
              <button type="button" (click)="cancelEdit()" class="cancel-btn">Cancelar</button>
            </div>
          </form>
        </div>
        
        <div class="list-section">
          <h3>Equipos Registrados</h3>
          <div class="equipos-grid">
            <div *ngFor="let equipo of equipos" class="equipo-card">
              <div class="equipo-header" [style.background-color]="equipo.colorPrimario || '#3498db'">
                <div class="logo-container" *ngIf="equipo.logoUrl">
                  <img [src]="equipo.logoUrl" [alt]="equipo.nombre + ' logo'" class="equipo-logo">
                </div>
                <h4>{{ equipo.nombre }}</h4>
                <span class="ciudad">{{ equipo.ciudad || 'Sin ciudad' }}</span>
              </div>
              <div class="equipo-body">
                <div class="colors" *ngIf="equipo.colorPrimario || equipo.colorSecundario">
                  <span class="color-box" [style.background-color]="equipo.colorPrimario" title="Color Primario"></span>
                  <span class="color-box" [style.background-color]="equipo.colorSecundario" title="Color Secundario"></span>
                </div>
                <div class="equipo-actions">
                  <button (click)="editEquipo(equipo)" class="edit-btn">Editar</button>
                  <button (click)="deleteEquipo(equipo.id!)" class="delete-btn">Eliminar</button>
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
    
    input {
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
    
    .equipos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .equipo-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .equipo-header {
      padding: 1rem;
      color: white;
      text-align: center;
      position: relative;
    }
    
    .logo-container {
      margin-bottom: 0.5rem;
    }
    
    .equipo-logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
      background: rgba(255,255,255,0.9);
      border-radius: 50%;
      padding: 5px;
    }
    
    .equipo-header h4 {
      margin: 0 0 0.5rem 0;
    }
    
    .ciudad {
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .equipo-body {
      padding: 1rem;
    }
    
    .colors {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .color-box {
      width: 30px;
      height: 30px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .equipo-actions {
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
  `]
})
export class EquiposComponent implements OnInit {
  equipos: Equipo[] = [];
  currentEquipo: Equipo = { nombre: '', activo: true };
  editingEquipo = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEquipos();
  }

  loadEquipos() {
    this.http.get<Equipo[]>('http://localhost:5163/api/equipos').subscribe({
      next: (equipos) => this.equipos = equipos,
      error: (err) => console.error('Error loading equipos:', err)
    });
  }

  saveEquipo() {
    if (this.editingEquipo) {
      const updateData = {
        nombre: this.currentEquipo.nombre,
        ciudad: this.currentEquipo.ciudad,
        logoUrl: this.currentEquipo.logoUrl,
        colorPrimario: this.currentEquipo.colorPrimario,
        colorSecundario: this.currentEquipo.colorSecundario,
        activo: this.currentEquipo.activo
      };
      
      this.http.put<Equipo>(`http://localhost:5163/api/equipos/${this.currentEquipo.id}`, updateData).subscribe({
        next: () => {
          this.loadEquipos();
          this.cancelEdit();
        },
        error: (err) => console.error('Error updating equipo:', err)
      });
    } else {
      const createData = {
        nombre: this.currentEquipo.nombre,
        ciudad: this.currentEquipo.ciudad,
        logoUrl: this.currentEquipo.logoUrl,
        colorPrimario: this.currentEquipo.colorPrimario,
        colorSecundario: this.currentEquipo.colorSecundario
      };
      
      this.http.post<Equipo>('http://localhost:5163/api/equipos', createData).subscribe({
        next: () => {
          this.loadEquipos();
          this.cancelEdit();
        },
        error: (err) => console.error('Error creating equipo:', err)
      });
    }
  }

  editEquipo(equipo: Equipo) {
    this.currentEquipo = { ...equipo };
    this.editingEquipo = true;
  }

  deleteEquipo(id: number) {
    if (confirm('¿Estás seguro de eliminar este equipo?')) {
      this.http.delete(`http://localhost:5163/api/equipos/${id}`).subscribe({
        next: () => this.loadEquipos(),
        error: (err) => console.error('Error deleting equipo:', err)
      });
    }
  }

  cancelEdit() {
    this.currentEquipo = { nombre: '', activo: true };
    this.editingEquipo = false;
  }
}
