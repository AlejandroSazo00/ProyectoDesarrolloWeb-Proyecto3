import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Verificar que el usuario sea admin
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      alert('Acceso denegado. Solo administradores pueden acceder a los reportes.');
      this.router.navigate(['/admin']);
      return;
    }
  }

  // Métodos para generar reportes
  generarReporteEquipos(): void {
    if (this.validarAcceso()) {
      window.open('http://104.131.96.162:8000/api/reports/equipos', '_blank');
    }
  }

  generarReporteJugadores(): void {
    if (this.validarAcceso()) {
      const equipoId = prompt('Ingrese el ID del equipo:');
      if (equipoId) {
        window.open(`http://104.131.96.162:8000/api/reports/jugadores/${equipoId}`, '_blank');
      }
    }
  }

  generarReportePartidos(): void {
    if (this.validarAcceso()) {
      window.open('http://104.131.96.162:8000/api/reports/partidos', '_blank');
    }
  }

  generarReporteRoster(): void {
    if (this.validarAcceso()) {
      const partidoId = prompt('Ingrese el ID del partido:');
      if (partidoId) {
        window.open(`http://104.131.96.162:8000/api/reports/roster/${partidoId}`, '_blank');
      }
    }
  }

  generarReporteEstadisticas(): void {
    if (this.validarAcceso()) {
      const jugadorId = prompt('Ingrese el ID del jugador:');
      if (jugadorId) {
        window.open(`http://104.131.96.162:8000/api/reports/estadisticas/${jugadorId}`, '_blank');
      }
    }
  }

  private validarAcceso(): boolean {
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      alert('Acceso denegado. Solo administradores pueden generar reportes.');
      this.router.navigate(['/admin']);
      return false;
    }
    return true;
  }
}

