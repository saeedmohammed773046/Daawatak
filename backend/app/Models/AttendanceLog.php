<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AttendanceLog extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = true;
    const UPDATED_AT = null; // attendance_logs table has no updated_at column

    protected $fillable = [
        'event_id',
        'guest_id',
        'receptionist_id',
        'status',
        'device_info',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function receptionist()
    {
        return $this->belongsTo(User::class, 'receptionist_id');
    }
}
