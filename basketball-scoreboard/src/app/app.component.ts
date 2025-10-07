import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, ActivatedRoute } from '@angular/router';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';
import { TimerComponent } from './timer/timer.component';
import { GameService } from './services/game.service';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ScoreboardComponent, TimerComponent],
  template: `
    <nav class="top-nav">
      <div class="brand">🏀 Basketball</div>
      <div class="links">
        <a routerLink="/" class="link">Scoreboard</a>
        <a routerLink="/admin" class="link">Admin</a>
        <a *ngIf="!isAuthenticated()" routerLink="/login" class="link">Login</a>
        <button *ngIf="isAuthenticated()" class="link as-button" (click)="logout()">Logout</button>
      </div>
    </nav>
    <router-outlet></router-outlet>
    <div class="app-container" (click)="onUserInteraction()">
      <audio #backgroundMusic loop>
        <source src="assets/videoplayback.mp3" type="audio/mpeg">
      </audio>
      <audio #chicharraSound>
        <source src="assets/Chicharra-de-Basquet-Efecto-de-Sonido-_mejorado_.mp3" type="audio/mpeg">
      </audio>
      <h1>Basketball Scoreboard</h1>
      <div class="audio-notice" *ngIf="!audioStarted">
        🔊 Haz clic en cualquier lugar para activar la música de fondo
      </div>
      <app-timer (quarterEnded)="onQuarterEnded()" (winnerShown)="onWinnerShown()" (winnerClosed)="onWinnerClosed()"></app-timer>
      <app-scoreboard #scoreboard></app-scoreboard>
    </div>
  `,
  styles: [`
    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background: #2c3e50;
      color: white;
    }
    
    .brand {
      font-size: 18px;
      font-weight: 600;
    }
    
    .links {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    
    .link {
      color: white;
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .link:hover {
      background: rgba(255,255,255,0.1);
    }
    
    .as-button {
      background: #e74c3c;
      border: none;
      cursor: pointer;
      font: inherit;
    }
    
    .as-button:hover {
      background: #c0392b;
    }
    
    .app-container {
      padding: 20px;
      text-align: center;
    }
    
    h1 {
      color: #333;
      margin-bottom: 30px;
    }
    
    .audio-notice {
      background: #ffeb3b;
      color: #333;
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
      font-size: 14px;
      cursor: pointer;
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild('scoreboard') scoreboard!: ScoreboardComponent;
  @ViewChild('backgroundMusic') backgroundMusic!: any;
  @ViewChild('chicharraSound') chicharraSound!: any;
  audioStarted = false;

  constructor(private gameService: GameService, private auth: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Initialize game when app starts
    this.gameService.initializeGame();
    
    // INTEGRACIÓN SEGURA: Escuchar parámetros opcionales para pre-cargar equipos
    this.route.queryParams.subscribe(params => {
      if (params['equipoLocal'] && params['equipoVisitante']) {
        // Solo si vienen parámetros, pre-cargar los nombres de equipos
        setTimeout(() => {
          if (this.scoreboard) {
            this.scoreboard.setTeamNames(params['equipoLocal'], params['equipoVisitante']);
          }
        }, 500);
      }
    });
    
    // Try to play audio after a short delay
    setTimeout(() => {
      this.playBackgroundMusic();
    }, 1000);
  }

  playBackgroundMusic(): void {
    if (this.backgroundMusic && this.backgroundMusic.nativeElement) {
      const audio = this.backgroundMusic.nativeElement;
      audio.volume = 0.15;
      audio.play().catch((error: any) => {
        console.log('Audio autoplay blocked by browser. Click anywhere to enable music.');
      });
    }
  }

  onUserInteraction(): void {
    if (!this.audioStarted) {
      this.playBackgroundMusic();
      this.audioStarted = true;
    }
  }

  onQuarterEnded(): void {
    // This method is called when the timer reaches 0
    // The timer component will automatically advance to the next quarter
    console.log('Quarter ended - timer will auto-advance');
  }

  onWinnerShown(): void {
    // Pause background music and play chicharra sound once
    if (this.backgroundMusic && this.backgroundMusic.nativeElement) {
      this.backgroundMusic.nativeElement.pause();
    }
    
    if (this.chicharraSound && this.chicharraSound.nativeElement) {
      const chicharra = this.chicharraSound.nativeElement;
      chicharra.currentTime = 0; // Reset to beginning
      chicharra.loop = false; // Ensure it only plays once
      chicharra.volume = 0.7; // Higher volume for effect
      chicharra.play().catch((error: any) => {
        console.log('Chicharra sound failed to play:', error);
      });
    }
  }

  onWinnerClosed(): void {
    // Resume background music when winner modal is closed
    if (this.backgroundMusic && this.backgroundMusic.nativeElement && this.audioStarted) {
      this.backgroundMusic.nativeElement.play().catch((error: any) => {
        console.log('Background music failed to resume:', error);
      });
    }
  }

  isAuthenticated(): boolean { return this.auth.isAuthenticated(); }
  logout(): void { this.auth.logout(); }
}
