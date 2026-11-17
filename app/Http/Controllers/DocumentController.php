<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Storage;

use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index()
    {
        $documents = auth()->user()
            ->documents()
            ->latest()
            ->get();

        return view('documents.index', compact('documents'));
    }

    public function create()
    {
        // Create a new document
        $document = auth()->user()->documents()->create([
            'title' => 'Untitled Document',
            'content' => [],
            'settings' => [
                'page_size' => 'A4',
                'orientation' => 'portrait',
                'margin_top' => 25,
                'margin_bottom' => 25,
                'margin_left' => 20,
                'margin_right' => 20,
                'padding' => 10,
                'background' => '#FFFFFF',
            ],
        ]);

        return redirect()->route('documents.edit', $document->id);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $document = auth()->user()->documents()->create([
            'title' => $request->title,
            'content' => [],
            'settings' => [
                'page_size' => 'A4',
                'orientation' => 'portrait',
                'margin_top' => 25,
                'margin_bottom' => 25,
                'margin_left' => 20,
                'margin_right' => 20,
                'padding' => 10,
                'background' => '#FFFFFF',
            ],
        ]);

        return redirect()->route('documents.edit', $document->id);
    }

    public function edit($id)
    {
        $document = auth()->user()
            ->documents()
            ->findOrFail($id);

        return view('documents.editor', compact('document'));
    }

    public function update(Request $request, $id)
    {
        // Only allow the document owner to update it
        $document = auth()->user()
            ->documents()
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'present|array',
            'settings' => 'present|array',
        ]);

        $document->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'settings' => $validated['settings'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document saved successfully!',
            'updated_at' => $document->fresh()->updated_at,
        ]);
    }

    public function uploadImage(Request $request, $id)
    {
        $document = auth()->user()->documents()->findOrFail($id);

        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        $path = $request->file('image')->store(
            "documents/{$document->id}/images",
            'public'
        );

        return response()->json([
            'success' => true,
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    public function destroy($id)
    {
        $document = auth()->user()
            ->documents()
            ->findOrFail($id);

        $document->delete();

        return redirect()->route('documents.index')
            ->with('success', 'Document deleted successfully!');
    }
}
