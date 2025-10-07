import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Partido {
  id: number;
  equipoLocal: string;
  puntosLocal: number;
  equipoVisitante: string;
  puntosVisitante: number;
  cuartoActual: number;
  tiempoRestante: number;
  fecha: Date;
  faltas: Falta[];
}

export interface Falta {
  id: number;
  partidoId: number;
  equipo: string;
  faltas: number;
}

export interface CreatePartidoDto {
  equipoLocal: string;
  equipoVisitante: string;
}

export interface UpdatePartidoDto {
  puntosLocal: number;
  puntosVisitante: number;
  cuartoActual: number;
  tiempoRestante: number;
}

export interface UpdateFaltasDto {
  partidoId: number;
  equipo: string;
  faltas: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5163/api';

  constructor(private http: HttpClient) { }

  // Partidos endpoints
  createPartido(dto: CreatePartidoDto): Observable<Partido> {
    return this.http.post<Partido>(`${this.baseUrl}/partidos`, dto);
  }

  getPartido(id: number): Observable<Partido> {
    return this.http.get<Partido>(`${this.baseUrl}/partidos/${id}`);
  }

  updatePartido(id: number, dto: UpdatePartidoDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/partidos/${id}`, dto);
  }

  getPartidos(): Observable<Partido[]> {
    return this.http.get<Partido[]>(`${this.baseUrl}/partidos`);
  }

  // Faltas endpoints
  updateFaltas(dto: UpdateFaltasDto): Observable<Falta> {
    return this.http.post<Falta>(`${this.baseUrl}/faltas`, dto);
  }

  getFaltasByPartido(partidoId: number): Observable<Falta[]> {
    return this.http.get<Falta[]>(`${this.baseUrl}/faltas/${partidoId}`);
  }
}
