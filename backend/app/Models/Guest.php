<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Guest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'event_id',
        'name',
        'phone',
        'email',
        'category',
        'companions_count',
        'notes',
        'invitation_status',
        'attendance_status',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function qrCode()
    {
        return $this->hasOne(QrCode::class);
    }

    public function attendanceLogs()
    {
        return $this->hasMany(AttendanceLog::class);
    }
}
