<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Player extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre_completo',
        'numero',
        'equipo_id',
        'posicion',
        'edad',
        'estatura',
        'peso',
        'nacionalidad',
        'fecha_nacimiento',
        'activo',
        'foto_url',
        'biografia',
        'experiencia_anos',
        'salario',
        'contrato_hasta'
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'contrato_hasta' => 'date',
        'activo' => 'boolean',
        'estatura' => 'decimal:2',
        'peso' => 'decimal:1',
        'salario' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $hidden = [
        'salario',
        'deleted_at'
    ];

    protected $appends = [
        'edad_calculada',
        'estado_contrato'
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByTeam($query, $teamId)
    {
        return $query->where('equipo_id', $teamId);
    }

    public function scopeByPosition($query, $position)
    {
        return $query->where('posicion', $position);
    }

    public function scopeByNationality($query, $nationality)
    {
        return $query->where('nacionalidad', $nationality);
    }

    // Accessors
    public function getEdadCalculadaAttribute()
    {
        if ($this->fecha_nacimiento) {
            return $this->fecha_nacimiento->age;
        }
        return $this->edad;
    }

    public function getEstadoContratoAttribute()
    {
        if (!$this->contrato_hasta) {
            return 'Sin contrato definido';
        }

        if ($this->contrato_hasta->isPast()) {
            return 'Contrato vencido';
        }

        if ($this->contrato_hasta->diffInDays() <= 30) {
            return 'Contrato por vencer';
        }

        return 'Contrato vigente';
    }

    public function getNombreCortoAttribute()
    {
        $nombres = explode(' ', $this->nombre_completo);
        if (count($nombres) >= 2) {
            return $nombres[0] . ' ' . end($nombres);
        }
        return $this->nombre_completo;
    }

    // Mutators
    public function setNombreCompletoAttribute($value)
    {
        $this->attributes['nombre_completo'] = ucwords(strtolower($value));
    }

    public function setNacionalidadAttribute($value)
    {
        $this->attributes['nacionalidad'] = ucfirst(strtolower($value));
    }

    // Métodos de utilidad
    public function isActive()
    {
        return $this->activo === true;
    }

    public function activate()
    {
        $this->update(['activo' => true]);
    }

    public function deactivate()
    {
        $this->update(['activo' => false]);
    }

    public function hasValidContract()
    {
        return $this->contrato_hasta && $this->contrato_hasta->isFuture();
    }

    public function getExperienceLevel()
    {
        if (!$this->experiencia_anos) {
            return 'Novato';
        }

        if ($this->experiencia_anos < 2) {
            return 'Principiante';
        } elseif ($this->experiencia_anos < 5) {
            return 'Intermedio';
        } elseif ($this->experiencia_anos < 10) {
            return 'Experimentado';
        } else {
            return 'Veterano';
        }
    }

    public function getPositionName()
    {
        $positions = [
            'PG' => 'Base',
            'SG' => 'Escolta',
            'SF' => 'Alero',
            'PF' => 'Ala-Pivot',
            'C' => 'Pivot'
        ];

        return $positions[$this->posicion] ?? $this->posicion;
    }

    // Validaciones personalizadas
    public static function boot()
    {
        parent::boot();

        static::creating(function ($player) {
            // Validar número único por equipo
            if (self::where('equipo_id', $player->equipo_id)
                    ->where('numero', $player->numero)
                    ->where('activo', true)
                    ->exists()) {
                throw new \Exception("El número {$player->numero} ya está en uso en este equipo");
            }
        });

        static::updating(function ($player) {
            // Validar número único por equipo al actualizar
            if ($player->isDirty(['numero', 'equipo_id'])) {
                if (self::where('equipo_id', $player->equipo_id)
                        ->where('numero', $player->numero)
                        ->where('id', '!=', $player->id)
                        ->where('activo', true)
                        ->exists()) {
                    throw new \Exception("El número {$player->numero} ya está en uso en este equipo");
                }
            }
        });
    }
}
