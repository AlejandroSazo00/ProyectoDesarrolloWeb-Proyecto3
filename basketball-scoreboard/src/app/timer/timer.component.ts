import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, interval, Subscription, EMPTY } from 'rxjs';
import { map, takeWhile, tap } from 'rxjs/operators';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {
  @Output() quarterEnded = new EventEmitter<void>();
  @Output() winnerShown = new EventEmitter<void>();
  @Output() winnerClosed = new EventEmitter<void>();
  
  totalSeconds: number = 600; // 10 minutes default (configurable)
  defaultTime: number = 600;
  isRunning: boolean = false;
  isTimeUp: boolean = false;
  currentQuarter: number = 1;
  winnerInfo: any = null;
  private timerSubscription?: Subscription;
  private gameStateSubscription?: Subscription;
  private timer$: Observable<number> = EMPTY;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Initialize timer observable but don't start it
    this.setupTimer();
    
    // Subscribe to game state changes
    this.gameStateSubscription = this.gameService.gameState$.subscribe(state => {
      this.currentQuarter = state.currentQuarter;
      // Only update timer if it's not currently running to avoid resetting during gameplay
      if (!this.isRunning) {
        this.totalSeconds = state.timeRemaining;
      }
    });
  }

  get displayTime(): string {
    const mins = Math.floor(this.totalSeconds / 60);
    const secs = this.totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  get timerClass(): string {
    if (this.isTimeUp) return 'time-up';
    if (this.totalSeconds <= 60 && this.totalSeconds > 0) return 'warning-time';
    return '';
  }

  private setupTimer(): void {
    this.timer$ = interval(1000).pipe(
      takeWhile(() => this.isRunning && this.totalSeconds > 0),
      tap(() => {
        this.totalSeconds--;
        if (this.totalSeconds <= 0) {
          this.totalSeconds = 0;
          this.isTimeUp = true;
          this.isRunning = false;
          this.quarterEnded.emit();
          // Update database with timer change
          this.gameService.updateTimer(this.totalSeconds);
          // Auto-advance to next quarter if not the final quarter
          setTimeout(() => {
            if (this.currentQuarter < 4) {
              this.nextQuarter();
            }
          }, 2000); // Wait 2 seconds before advancing
        } else {
          // Update database with timer change every 30 seconds to avoid too many calls
          if (this.totalSeconds % 30 === 0) {
            this.gameService.updateTimer(this.totalSeconds);
          }
        }
      })
    );
  }

  start(): void {
    if (!this.isRunning && this.totalSeconds > 0) {
      this.isRunning = true;
      this.isTimeUp = false;
      this.setupTimer();
      this.timerSubscription = this.timer$.subscribe();
    }
  }

  pause(): void {
    this.isRunning = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    // Save current timer state to database when paused
    this.gameService.updateTimer(this.totalSeconds);
  }

  reset(): void {
    this.pause();
    this.totalSeconds = this.defaultTime;
    this.isTimeUp = false;
  }

  async nextQuarter(): Promise<void> {
    if (this.currentQuarter < 4) {
      const newQuarter = this.currentQuarter + 1;
      await this.gameService.updateQuarter(newQuarter);
      this.reset();
    }
  }

  async resetGame(): Promise<void> {
    await this.gameService.resetGame();
  }

  showWinner(): void {
    // Emit event to pause background music and play chicharra
    this.winnerShown.emit();
    
    this.gameService.gameState$.subscribe(state => {
      const localScore = state.localScore;
      const visitanteScore = state.visitanteScore;
      const localFouls = state.localFouls;
      const visitanteFouls = state.visitanteFouls;

      if (localScore > visitanteScore) {
        this.winnerInfo = {
          winner: 'GANADOR: Local',
          score: `${localScore} - ${visitanteScore}`,
          fouls: `${localFouls} faltas`
        };
      } else if (visitanteScore > localScore) {
        this.winnerInfo = {
          winner: 'GANADOR: Visitante',
          score: `${localScore} - ${visitanteScore}`,
          fouls: `${visitanteFouls} faltas`
        };
      } else {
        this.winnerInfo = {
          winner: 'EMPATE',
          score: `${localScore} - ${visitanteScore}`,
          fouls: `Local: ${localFouls}, Visitante: ${visitanteFouls} faltas`
        };
      }
    }).unsubscribe();
  }

  closeWinner(): void {
    this.winnerInfo = null;
    // Emit event to resume background music
    this.winnerClosed.emit();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }
  }
}
