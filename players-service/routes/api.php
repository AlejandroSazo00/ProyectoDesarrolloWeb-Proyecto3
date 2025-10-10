<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlayerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/health', [PlayerController::class, 'health']);

Route::prefix('players')->group(function () {
    // CRUD básico
    Route::get('/', [PlayerController::class, 'index']);
    Route::post('/', [PlayerController::class, 'store']);
    Route::get('/{id}', [PlayerController::class, 'show']);
    Route::put('/{id}', [PlayerController::class, 'update']);
    Route::delete('/{id}', [PlayerController::class, 'destroy']);
    
    // Rutas especiales
    Route::get('/team/{teamId}', [PlayerController::class, 'byTeam']);
    Route::patch('/{id}/activate', [PlayerController::class, 'activate']);
    Route::patch('/{id}/deactivate', [PlayerController::class, 'deactivate']);
    Route::get('/stats/summary', [PlayerController::class, 'stats']);
});

// Ruta de información del servicio
Route::get('/', function () {
    return response()->json([
        'service' => 'Basketball Players Service',
        'version' => '1.0.0',
        'status' => 'running',
        'endpoints' => [
            'GET /api/players' => 'Lista de jugadores',
            'POST /api/players' => 'Crear jugador',
            'GET /api/players/{id}' => 'Obtener jugador',
            'PUT /api/players/{id}' => 'Actualizar jugador',
            'DELETE /api/players/{id}' => 'Eliminar jugador',
            'GET /api/players/team/{teamId}' => 'Jugadores por equipo',
            'GET /api/players/stats/summary' => 'Estadísticas',
            'GET /api/health' => 'Health check'
        ]
    ]);
});
