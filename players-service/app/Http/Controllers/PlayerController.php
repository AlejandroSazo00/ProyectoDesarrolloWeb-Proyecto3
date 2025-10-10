<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PlayerController extends Controller
{
    /**
     * Display a listing of players.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Player::query();

            // Filtros
            if ($request->has('equipo_id')) {
                $query->byTeam($request->equipo_id);
            }

            if ($request->has('posicion')) {
                $query->byPosition($request->posicion);
            }

            if ($request->has('nacionalidad')) {
                $query->byNationality($request->nacionalidad);
            }

            if ($request->has('activo')) {
                $query->where('activo', $request->boolean('activo'));
            }

            // Búsqueda por nombre
            if ($request->has('search')) {
                $search = $request->search;
                $query->where('nombre_completo', 'LIKE', "%{$search}%");
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'nombre_completo');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = min($request->get('per_page', 15), 100);
            $players = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $players->items(),
                'pagination' => [
                    'current_page' => $players->currentPage(),
                    'last_page' => $players->lastPage(),
                    'per_page' => $players->perPage(),
                    'total' => $players->total(),
                    'from' => $players->firstItem(),
                    'to' => $players->lastItem()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener jugadores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created player.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre_completo' => 'required|string|max:255',
                'numero' => 'required|integer|min:0|max:99',
                'equipo_id' => 'required|integer',
                'posicion' => 'nullable|string|in:PG,SG,SF,PF,C',
                'edad' => 'nullable|integer|min:16|max:50',
                'estatura' => 'nullable|numeric|min:1.50|max:2.50',
                'peso' => 'nullable|numeric|min:50|max:200',
                'nacionalidad' => 'nullable|string|max:100',
                'fecha_nacimiento' => 'nullable|date|before:today',
                'foto_url' => 'nullable|url',
                'biografia' => 'nullable|string|max:1000',
                'experiencia_anos' => 'nullable|integer|min:0|max:30',
                'salario' => 'nullable|numeric|min:0',
                'contrato_hasta' => 'nullable|date|after:today'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $playerData = $validator->validated();
            $playerData['activo'] = $request->get('activo', true);

            $player = Player::create($playerData);

            return response()->json([
                'success' => true,
                'message' => 'Jugador creado exitosamente',
                'data' => $player->fresh()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear jugador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified player.
     */
    public function show($id): JsonResponse
    {
        try {
            $player = Player::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $player
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Jugador no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener jugador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified player.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $player = Player::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre_completo' => 'sometimes|string|max:255',
                'numero' => 'sometimes|integer|min:0|max:99',
                'equipo_id' => 'sometimes|integer',
                'posicion' => 'nullable|string|in:PG,SG,SF,PF,C',
                'edad' => 'nullable|integer|min:16|max:50',
                'estatura' => 'nullable|numeric|min:1.50|max:2.50',
                'peso' => 'nullable|numeric|min:50|max:200',
                'nacionalidad' => 'nullable|string|max:100',
                'fecha_nacimiento' => 'nullable|date|before:today',
                'activo' => 'sometimes|boolean',
                'foto_url' => 'nullable|url',
                'biografia' => 'nullable|string|max:1000',
                'experiencia_anos' => 'nullable|integer|min:0|max:30',
                'salario' => 'nullable|numeric|min:0',
                'contrato_hasta' => 'nullable|date|after:today'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $player->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Jugador actualizado exitosamente',
                'data' => $player->fresh()
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Jugador no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar jugador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified player.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $player = Player::findOrFail($id);
            $player->delete();

            return response()->json([
                'success' => true,
                'message' => 'Jugador eliminado exitosamente'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Jugador no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar jugador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get players by team.
     */
    public function byTeam($teamId): JsonResponse
    {
        try {
            $players = Player::byTeam($teamId)
                ->active()
                ->orderBy('numero')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $players,
                'team_id' => $teamId,
                'total_players' => $players->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener jugadores del equipo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate a player.
     */
    public function activate($id): JsonResponse
    {
        try {
            $player = Player::findOrFail($id);
            $player->activate();

            return response()->json([
                'success' => true,
                'message' => 'Jugador activado exitosamente',
                'data' => $player->fresh()
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Jugador no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al activar jugador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate a player.
     */
    public function deactivate($id): JsonResponse
    {
        try {
            $player = Player::findOrFail($id);
            $player->deactivate();

            return response()->json([
                'success' => true,
                'message' => 'Jugador desactivado exitosamente',
                'data' => $player->fresh()
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Jugador no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar jugador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get player statistics.
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_players' => Player::count(),
                'active_players' => Player::where('activo', true)->count(),
                'inactive_players' => Player::where('activo', false)->count(),
                'players_by_position' => Player::selectRaw('posicion, COUNT(*) as count')
                    ->whereNotNull('posicion')
                    ->groupBy('posicion')
                    ->pluck('count', 'posicion'),
                'players_by_nationality' => Player::selectRaw('nacionalidad, COUNT(*) as count')
                    ->whereNotNull('nacionalidad')
                    ->groupBy('nacionalidad')
                    ->orderByDesc('count')
                    ->limit(10)
                    ->pluck('count', 'nacionalidad'),
                'average_age' => Player::whereNotNull('edad')->avg('edad'),
                'average_height' => Player::whereNotNull('estatura')->avg('estatura'),
                'average_weight' => Player::whereNotNull('peso')->avg('peso')
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Health check endpoint.
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'UP',
            'service' => 'players-service',
            'timestamp' => now()->toISOString(),
            'database' => 'connected'
        ]);
    }
}
