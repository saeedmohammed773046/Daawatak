<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect(env('FRONTEND_URL', 'https://daawatak-1.onrender.com'));
});
