<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminSubscriptionController extends Controller
{
    public function index()
    {
        $subscriptions = Subscription::with(['user', 'plan'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    public function payments()
    {
        $payments = Payment::with(['user', 'subscription.plan'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $subscription = Subscription::find($id);

        if (!$subscription) {
            return response()->json(['success' => false, 'message' => 'الاشتراك غير موجود'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:active,expired,cancelled',
            'extend_days' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات التحديث غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = ['status' => $request->status];

        if ($request->filled('extend_days')) {
            $currentEnd = Carbon::parse($subscription->ends_at);
            $data['ends_at'] = $currentEnd->isPast()
                ? Carbon::now()->addDays($request->extend_days)
                : $currentEnd->addDays($request->extend_days);
        }

        $subscription->update($data);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة الاشتراك بنجاح',
            'data' => $subscription
        ]);
    }
}
