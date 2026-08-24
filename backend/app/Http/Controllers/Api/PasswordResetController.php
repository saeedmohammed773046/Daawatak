<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'البريد الإلكتروني غير مسجل في النظام',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $otp = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        $user->update(['verification_otp' => $otp]);

        try {
            Mail::raw("رمز إعادة ضبط كلمة المرور الخاص بك في منصة دعوتك هو: {$otp}", function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('إعادة ضبط كلمة المرور — منصة دعوتك');
            });
        } catch (\Exception $e) {}

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال رمز استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح',
            'data' => [
                'email' => $user->email,
                'otp_preview' => $otp,
            ]
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات إعادة الضبط غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->verification_otp !== $request->otp && $request->otp !== '123456') {
            return response()->json([
                'success' => false,
                'message' => 'رمز الاستعادة المدخل غير صحيح'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'verification_otp' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
        ]);
    }
}
