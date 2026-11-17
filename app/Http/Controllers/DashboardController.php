<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $documents = auth()->user()
            ->documents()
            ->latest()
            ->take(5)
            ->get();

        $totalDocuments = auth()->user()
            ->documents()
            ->count();

        return view('dashboard', compact(
            'documents',
            'totalDocuments'
        ));
    }
}