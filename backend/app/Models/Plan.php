<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Plan extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'price',
        'max_events',
        'max_guests_per_event',
        'max_receptionists',
        'validity_days',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
