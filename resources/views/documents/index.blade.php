@extends('layouts.app')

@section('title', 'My Documents - PDF Editor')

@section('content')

    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
            <h1 class="h3 fw-bold text-dark mb-1">My Documents</h1>
            <p class="text-muted small mb-0">Manage and organize all your PDF documents in one place</p>
        </div>
        <div>
            <button type="button" class="btn btn-primary d-inline-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#newDocumentModal">
                <i class="bi bi-plus-lg"></i>
                <span>Create Document</span>
            </button>
        </div>
    </div>

    <!-- Alert Messages -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show py-2 px-3 small mb-4" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- Documents List Card -->
    <div class="card border-0 shadow-sm rounded-3">
        <div class="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-dark mb-0 fs-6">All Documents</h5>
            <span class="badge bg-primary-subtle text-primary border-0 rounded-pill px-3 py-1">
                {{ $documents->count() }} Total
            </span>
        </div>
        <div class="card-body p-0">
            @if($documents->count() > 0)
                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Document</th>
                                <th>Created</th>
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
                                                <div class="text-muted small" style="font-size: 0.75rem;">ID: #{{ $document->id }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-muted small">
                                        {{ $document->created_at->format('d M Y') }}
                                    </td>
                                    <td class="text-muted small">
                                        {{ $document->updated_at->diffForHumans() }}
                                    </td>
                                    <td class="text-end">
                                        <a href="{{ route('documents.edit', $document->id) }}" class="btn btn-sm btn-outline-primary me-2">
                                            <i class="bi bi-pencil-square me-1"></i> Edit
                                        </a>
                                        <form action="{{ route('documents.destroy', $document->id) }}"
                                              method="POST"
                                              class="d-inline"
                                              onsubmit="return confirm('Are you sure you want to delete this document?')">
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
                    <h6 class="fw-semibold text-dark mb-1">No documents found</h6>
                    <p class="text-muted small mb-3">Get started by creating your first document.</p>
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#newDocumentModal">
                        <i class="bi bi-plus-lg me-1"></i> Create Document
                    </button>
                </div>
            @endif
        </div>
    </div>

@endsection
