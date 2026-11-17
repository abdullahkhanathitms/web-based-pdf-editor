@extends('layouts.app')

@section('title', 'Dashboard - PDF Editor')

@section('content')

    <!-- Dashboard Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
            <h1 class="h3 fw-bold text-dark mb-1">Dashboard</h1>
            <p class="text-muted small mb-0">Welcome back, <strong>{{ auth()->user()->name }}</strong></p>
        </div>
        <div>
            <button type="button" class="btn btn-primary d-inline-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#newDocumentModal">
                <i class="bi bi-plus-lg"></i>
                <span>Create Document</span>
            </button>
        </div>
    </div>

    <!-- Metric Cards -->
    <div class="row g-4 mb-4">
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm rounded-3">
                <div class="card-body p-4">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <span class="text-muted small fw-semibold text-uppercase">Total Documents</span>
                        <div class="rounded-3 p-2 bg-primary-subtle text-primary">
                            <i class="bi bi-file-earmark-text fs-4"></i>
                        </div>
                    </div>
                    <h2 class="h1 fw-bold text-dark mb-0">{{ $totalDocuments }}</h2>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Documents Section -->
    <div class="card border-0 shadow-sm rounded-3">
        <div class="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-dark mb-0 fs-6">Recent Documents</h5>
            @if($documents->count() > 0)
                <a href="{{ route('documents.index') }}" class="text-primary text-decoration-none small fw-semibold">
                    View All ({{ $totalDocuments }}) &rarr;
                </a>
            @endif
        </div>
        <div class="card-body p-0">
            @if($documents->count() > 0)
                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Document</th>
                                <th>Last Updated</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($documents as $document)
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-3">
                                            <div class="rounded-2 p-2 bg-primary-subtle text-primary">
                                                <i class="bi bi-file-earmark-pdf fs-5"></i>
                                            </div>
                                            <div>
                                                <a href="{{ route('documents.edit', $document->id) }}" class="fw-semibold text-dark text-decoration-none">
                                                    {{ $document->title ?: 'Untitled Document' }}
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-muted small">
                                        {{ $document->updated_at->diffForHumans() }}
                                    </td>
                                    <td class="text-end">
                                        <a href="{{ route('documents.edit', $document->id) }}" class="btn btn-sm btn-outline-primary me-2">
                                            <i class="bi bi-pencil-square me-1"></i> Edit
                                        </a>
                                        <form action="{{ route('documents.destroy', $document->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Are you sure you want to delete this document?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="text-center py-5">
                    <div class="rounded-circle bg-light d-inline-flex p-3 text-muted mb-3">
                        <i class="bi bi-file-earmark-x fs-2"></i>
                    </div>
                    <h6 class="fw-semibold text-dark mb-1">No documents yet</h6>
                    <p class="text-muted small mb-3">Create your first PDF document to get started.</p>
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#newDocumentModal">
                        <i class="bi bi-plus-lg me-1"></i> Create Document
                    </button>
                </div>
            @endif
        </div>
    </div>

@endsection
