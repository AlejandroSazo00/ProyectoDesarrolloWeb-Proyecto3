// Servicio de autenticación - maneja login, logout y verificación de permisos
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// Interfaz para la respuesta del login
interface LoginResponse {
  token: string;    // Token JWT para autenticación
  username: string; // Nombre del usuario
  role: string;     // Rol del usuario (Admin)
  expiresAt: string; // Fecha de expiración del token
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Claves para almacenar datos en localStorage
  private readonly tokenKey = 'auth_token';
  private readonly expiresKey = 'auth_expires';
  private readonly roleKey = 'auth_role';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<LoginResponse>('http://localhost:5163/api/auth/login', { username, password });
  }

  saveSession(token: string, expiresAt: string, role?: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.expiresKey, expiresAt);
    if (role) localStorage.setItem(this.roleKey, role);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const exp = localStorage.getItem(this.expiresKey);
    if (!token || !exp) return false;
    return new Date(exp) > new Date();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiresKey);
    localStorage.removeItem(this.roleKey);
    this.router.navigate(['/login']);
  }
}
