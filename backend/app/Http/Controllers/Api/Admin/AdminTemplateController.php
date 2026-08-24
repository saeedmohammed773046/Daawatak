<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvitationTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminTemplateController extends Controller
{
    public function index()
    {
        $templates = InvitationTemplate::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'base_image_url' => 'required|string|max:500',
            'coordinates_config' => 'required|array',
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات القالب غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $template = InvitationTemplate::create([
            'user_id' => null, // Global public system template
            'name' => $request->name,
            'base_image_url' => $request->base_image_url,
            'coordinates_config' => $request->coordinates_config,
            'is_public' => $request->input('is_public', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء القالب العام بنجاح',
            'data' => $template
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $template = InvitationTemplate::find($id);

        if (!$template) {
            return response()->json(['success' => false, 'message' => 'القالب غير موجود'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'base_image_url' => 'sometimes|required|string|max:500',
            'coordinates_config' => 'sometimes|required|array',
            'is_public' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات القالب غير صالحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $template->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث القالب بنجاح',
            'data' => $template
        ]);
    }

    public function destroy($id)
    {
        $template = InvitationTemplate::find($id);

        if (!$template) {
            return response()->json(['success' => false, 'message' => 'القالب غير موجود'], 404);
        }

        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف القالب بنجاح'
        ]);
    }
}
