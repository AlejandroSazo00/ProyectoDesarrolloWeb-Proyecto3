import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'admin', loadComponent: () => import('./admin/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [authGuard] },
  { path: 'admin/dashboard', loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'admin/equipos', loadComponent: () => import('./admin/equipos/equipos.component').then(m => m.EquiposComponent), canActivate: [authGuard] },
  { path: 'admin/jugadores', loadComponent: () => import('./admin/jugadores/jugadores.component').then(m => m.JugadoresComponent), canActivate: [authGuard] },
  { path: 'admin/partidos', loadComponent: () => import('./admin/partidos/partidos.component').then(m => m.PartidosComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
