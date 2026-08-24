<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminPlanController extends Controller
{
    public function index()
    {
        $plans = Plan::orderBy('price', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'max_events' => 'required|integer|min:1',
            'max_guests_per_event' => 'required|integer|min:1',
            'max_receptionists' => 'required|integer|min:1',
            'validity_days' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات الخطة غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $plan = Plan::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الخطة بنجاح',
            'data' => $plan
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::find($id);

        if (!$plan) {
            return response()->json(['success' => false, 'message' => 'الخطة غير موجودة'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'max_events' => 'sometimes|required|integer|min:1',
            'max_guests_per_event' => 'sometimes|required|integer|min:1',
            'max_receptionists' => 'sometimes|required|integer|min:1',
            'validity_days' => 'sometimes|required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات الخطة غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $plan->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الخطة بنجاح',
            'data' => $plan
        ]);
    }

    public function destroy($id)
    {
        $plan = Plan::find($id);

        if (!$plan) {
            return response()->json(['success' => false, 'message' => 'الخطة غير موجودة'], 404);
        }

        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الخطة بنجاح'
        ]);
    }
}
