import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { ApiService, Partido, CreatePartidoDto, UpdatePartidoDto, UpdateFaltasDto } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private currentPartidoId: number | null = null;
  private gameState = new BehaviorSubject<any>({
    localScore: 0,
    visitanteScore: 0,
    localFouls: 0,
    visitanteFouls: 0,
    currentQuarter: 1,
    timeRemaining: 600
  });

  public gameState$ = this.gameState.asObservable();

  constructor(private apiService: ApiService) {}

  async initializeGame(): Promise<void> {
    // Reset to initial state first
    this.updateGameState({
      localScore: 0,
      visitanteScore: 0,
      currentQuarter: 1,
      timeRemaining: 600,
      localFouls: 0,
      visitanteFouls: 0
    });

    const createDto: CreatePartidoDto = {
      equipoLocal: 'Local',
      equipoVisitante: 'Visitante'
    };

    try {
      const partido = await firstValueFrom(this.apiService.createPartido(createDto));
      if (partido) {
        this.currentPartidoId = partido.id;
        console.log('Game initialized with ID:', this.currentPartidoId);
      }
    } catch (error) {
      console.error('Error initializing game:', error);
      console.error('Full error details:', error);
      this.currentPartidoId = null;
    }
  }

  async updateScore(team: 'local' | 'visitante', points: number): Promise<void> {
    const currentState = this.gameState.value;
    const newState = { ...currentState };

    if (team === 'local') {
      newState.localScore = Math.max(0, currentState.localScore + points);
    } else {
      newState.visitanteScore = Math.max(0, currentState.visitanteScore + points);
    }

    // Update frontend immediately
    this.updateGameState(newState);

    // ALWAYS update backend immediately when score changes
    if (this.currentPartidoId) {
      const updateDto: UpdatePartidoDto = {
        puntosLocal: newState.localScore,
        puntosVisitante: newState.visitanteScore,
        cuartoActual: newState.currentQuarter,
        tiempoRestante: newState.timeRemaining
      };

      try {
        await firstValueFrom(this.apiService.updatePartido(this.currentPartidoId, updateDto));
        console.log(`Score updated: ${newState.localScore}-${newState.visitanteScore}, Quarter: ${newState.currentQuarter}, ID: ${this.currentPartidoId}`);
      } catch (error) {
        console.error('Error updating score in backend:', error);
      }
    } else {
      console.error('No currentPartidoId available for score update');
    }
  }

  async updateFouls(team: 'local' | 'visitante'): Promise<void> {
    const currentState = this.gameState.value;
    const newState = { ...currentState };

    if (team === 'local') {
      newState.localFouls++;
    } else {
      newState.visitanteFouls++;
    }

    // Update frontend immediately
    this.updateGameState(newState);

    // Try to update backend if available
    if (this.currentPartidoId) {
      const updateDto: UpdateFaltasDto = {
        partidoId: this.currentPartidoId,
        equipo: team === 'local' ? 'Local' : 'Visitante',
        faltas: team === 'local' ? newState.localFouls : newState.visitanteFouls
      };

      try {
        await firstValueFrom(this.apiService.updateFaltas(updateDto));
      } catch (error) {
        console.error('Error updating fouls in backend:', error);
      }
    }
  }

  async updateQuarter(quarter: number): Promise<void> {
    const currentState = this.gameState.value;
    
    // Save current quarter data before advancing
    if (this.currentPartidoId) {
      const saveCurrentDto: UpdatePartidoDto = {
        puntosLocal: currentState.localScore,
        puntosVisitante: currentState.visitanteScore,
        cuartoActual: currentState.currentQuarter,
        tiempoRestante: currentState.timeRemaining
      };

      try {
        await firstValueFrom(this.apiService.updatePartido(this.currentPartidoId, saveCurrentDto));
        console.log(`Quarter ${currentState.currentQuarter} data saved: ${currentState.localScore}-${currentState.visitanteScore}`);
      } catch (error) {
        console.error('Error saving current quarter:', error);
      }
    }

    // Create NEW record for new quarter
    const createDto: CreatePartidoDto = {
      equipoLocal: 'Local',
      equipoVisitante: 'Visitante'
    };

    try {
      const newPartido = await firstValueFrom(this.apiService.createPartido(createDto));
      if (newPartido) {
        this.currentPartidoId = newPartido.id;
        console.log(`New record created for quarter ${quarter} with ID: ${this.currentPartidoId}`);
        
        // Set quarter info in new record
        const updateDto: UpdatePartidoDto = {
          puntosLocal: 0,
          puntosVisitante: 0,
          cuartoActual: quarter,
          tiempoRestante: 600
        };
        
        await firstValueFrom(this.apiService.updatePartido(this.currentPartidoId, updateDto));
      }
    } catch (error) {
      console.error('Error creating new quarter record:', error);
    }

    // Reset scores AND fouls for new quarter
    const newState = { 
      ...currentState, 
      currentQuarter: quarter, 
      timeRemaining: 600,
      localScore: 0,
      visitanteScore: 0,
      localFouls: 0,
      visitanteFouls: 0
    };

    // Update frontend immediately
    this.updateGameState(newState);
  }

  async updateTimer(timeRemaining: number): Promise<void> {
    const currentState = this.gameState.value;
    const newState = { ...currentState, timeRemaining };

    // Update frontend immediately
    this.updateGameState(newState);

    // Update backend if we have a valid partido ID
    if (this.currentPartidoId) {
      const updateDto: UpdatePartidoDto = {
        puntosLocal: newState.localScore,
        puntosVisitante: newState.visitanteScore,
        cuartoActual: newState.currentQuarter,
        tiempoRestante: newState.timeRemaining
      };

      try {
        await firstValueFrom(this.apiService.updatePartido(this.currentPartidoId, updateDto));
      } catch (error) {
        console.error('Error updating timer:', error);
      }
    }
  }

  async resetGame(): Promise<void> {
    const currentState = this.gameState.value;
    
    // SPECIAL CASE: If we're in quarter 4, save the final data before resetting
    if (currentState.currentQuarter === 4 && this.currentPartidoId) {
      const saveFinalDto: UpdatePartidoDto = {
        puntosLocal: currentState.localScore,
        puntosVisitante: currentState.visitanteScore,
        cuartoActual: 4,
        tiempoRestante: currentState.timeRemaining
      };

      try {
        await firstValueFrom(this.apiService.updatePartido(this.currentPartidoId, saveFinalDto));
        console.log(`Quarter 4 FINAL data saved: ${currentState.localScore}-${currentState.visitanteScore} (ID: ${this.currentPartidoId})`);
      } catch (error) {
        console.error('Error saving quarter 4 final data:', error);
      }
    }
    
    // Reset all values to initial state
    this.updateGameState({
      localScore: 0,
      visitanteScore: 0,
      currentQuarter: 1,
      timeRemaining: 600,
      localFouls: 0,
      visitanteFouls: 0
    });
    
    // Initialize new game in backend
    await this.initializeGame();
  }

  private updateGameState(newState: any): void {
    this.gameState.next(newState);
  }

  getCurrentPartidoId(): number | null {
    return this.currentPartidoId;
  }

  // INTEGRACIÓN SEGURA: Método para pre-cargar nombres de equipos (OPCIONAL)
  setTeamNames(equipoLocal: string, equipoVisitante: string): void {
    // Este método permite cambiar los nombres de equipos sin afectar el funcionamiento
    // Si no se llama, usa los nombres por defecto "Local" y "Visitante"
    const currentState = this.gameState.value;
    this.updateGameState({
      ...currentState,
      equipoLocal: equipoLocal,
      equipoVisitante: equipoVisitante
    });
  }
}
