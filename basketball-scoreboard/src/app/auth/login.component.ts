import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-box">
        <h2>🏀 Admin Login</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Usuario:</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              name="username"
              required
              [disabled]="loading">
          </div>
          <div class="form-group">
            <label>Contraseña:</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              required
              [disabled]="loading">
          </div>
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
          <div *ngIf="error" class="error">{{ error }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: #2c3e50;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .login-box {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 350px;
    }
    
    h2 {
      text-align: center;
      margin-bottom: 25px;
      color: #2c3e50;
      font-size: 22px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }
    
    input:focus {
      outline: none;
      border-color: #3498db;
    }
    
    input:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
    
    button {
      width: 100%;
      padding: 12px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 10px;
    }
    
    button:hover:not(:disabled) {
      background: #2980b9;
    }
    
    button:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
    
    .error {
      color: #e74c3c;
      text-align: center;
      margin-top: 10px;
      font-size: 14px;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.auth.saveSession(res.token, res.expiresAt, res.role);
        this.loading = false;
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error ?? 'Error al iniciar sesión';
      }
    });
  }
}
