<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Event extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'event_date',
        'start_time',
        'end_time',
        'venue',
        'google_maps_url',
        'cover_image_url',
        'status',
        'access_pin',
        'theme_config',
    ];

    protected $casts = [
        'event_date' => 'date',
        'theme_config' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guests()
    {
        return $this->hasMany(Guest::class);
    }

    public function receptionists()
    {
        return $this->hasMany(Receptionist::class);
    }

    public function attendanceLogs()
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function qrCodes()
    {
        return $this->hasMany(QrCode::class);
    }
}
