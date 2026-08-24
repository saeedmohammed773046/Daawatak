<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالدخول، يرجى تسجيل الدخول أولاً.'
            ], 401);
        }

        if ($user->role === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'عذراً، تم تعليق وتجميد حسابك من قبل إدارة النظام.'
            ], 403);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'عذراً، ليس لديك صلاحية للوصول إلى هذا الجزء من النظام.'
            ], 403);
        }

        return $next($request);
    }
}
