import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-container">
      <header class="admin-header">
        <h1>🏀 Panel de Administración</h1>
        <div class="user-info">
          <span>Bienvenido, Admin</span>
          <button (click)="logout()" class="logout-btn">Cerrar Sesión</button>
        </div>
      </header>
      
      <div class="admin-content">
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <div class="card-icon">🏆</div>
            <h3>Equipos</h3>
            <p>Gestionar equipos de baloncesto</p>
            <a routerLink="/admin/equipos" class="card-btn">Administrar</a>
          </div>
          
          <div class="dashboard-card">
            <div class="card-icon">👥</div>
            <h3>Jugadores</h3>
            <p>Gestionar jugadores y roster</p>
            <a routerLink="/admin/jugadores" class="card-btn">Administrar</a>
          </div>
          
          <div class="dashboard-card">
            <div class="card-icon">🏀</div>
            <h3>Partidos</h3>
            <p>Crear y gestionar partidos</p>
            <a routerLink="/admin/partidos" class="card-btn">Administrar</a>
          </div>
          
          <div class="dashboard-card">
            <div class="card-icon">📊</div>
            <h3>Dashboard</h3>
            <p>Resumen y estadísticas</p>
            <a routerLink="/admin/dashboard" class="card-btn">Ver Dashboard</a>
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
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .admin-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .logout-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .logout-btn:hover {
      background: #c0392b;
    }
    
    .admin-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .dashboard-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 15px rgba(0,0,0,0.15);
    }
    
    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .dashboard-card h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .dashboard-card p {
      color: #7f8c8d;
      margin-bottom: 1.5rem;
    }
    
    .card-btn {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      transition: background-color 0.2s;
    }
    
    .card-btn:hover {
      background: #2980b9;
    }
  `]
})
export class AdminDashboardComponent {
  constructor(private auth: AuthService) {}
  
  logout() {
    this.auth.logout();
  }
}
