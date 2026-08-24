<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            if ($request->status === 'suspended') {
                $query->where('role', 'suspended');
            } elseif ($request->status === 'active') {
                $query->where('role', '!=', 'suspended');
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'المستخدم غير موجود'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|in:event_owner,receptionist,super_admin,user,reception'
        ]);

        $role = $validated['role'] ?? 'event_owner';
        if ($role === 'user') $role = 'event_owner';
        if ($role === 'reception') $role = 'receptionist';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => bcrypt($validated['password']),
            'role' => $role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء وإضافة الحساب بنجاح من قبل إدارة النظام',
            'data' => $user
        ], 201);
    }

    public function toggleStatus(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'المستخدم غير موجود'], 404);
        }

        if ($user->role === 'super_admin') {
            return response()->json(['success' => false, 'message' => 'لا يمكن تجميد حساب مدير النظام الرئيسي'], 400);
        }

        $newRole = $user->role === 'suspended' ? 'event_owner' : 'suspended';
        $user->update(['role' => $newRole]);

        if ($newRole === 'suspended') {
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $newRole === 'suspended' ? 'تم تعليق الحساب وإنهاء جلساته بنجاح' : 'تم إعادة تفعيل الحساب بنجاح',
            'data' => $user
        ]);
    }
}
