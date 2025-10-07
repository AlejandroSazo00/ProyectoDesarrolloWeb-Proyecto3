import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  localScore = 0;
  visitanteScore = 0;
  localFouls = 0;
  visitanteFouls = 0;
  private gameStateSubscription?: Subscription;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameStateSubscription = this.gameService.gameState$.subscribe(state => {
      this.localScore = state.localScore;
      this.visitanteScore = state.visitanteScore;
      this.localFouls = state.localFouls;
      this.visitanteFouls = state.visitanteFouls;
    });

    // Initialize game when component loads
    this.gameService.initializeGame();
  }

  ngOnDestroy(): void {
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }
  }

  async addPoints(team: 'local' | 'visitante', points: number): Promise<void> {
    await this.gameService.updateScore(team, points);
    this.animateScore();
  }

  async addFoul(team: 'local' | 'visitante'): Promise<void> {
    await this.gameService.updateFouls(team);
  }

  async resetGame(): Promise<void> {
    await this.gameService.resetGame();
  }

  animateScore(): void {
    // Trigger animation class - will be handled by CSS
  }

  // INTEGRACIÓN SEGURA: Método para pre-cargar nombres de equipos (OPCIONAL)
  setTeamNames(equipoLocal: string, equipoVisitante: string): void {
    // Este método permite pre-cargar nombres de equipos desde admin
    // Si no se llama, el marcador funciona exactamente igual que antes
    this.gameService.setTeamNames(equipoLocal, equipoVisitante);
  }
}
