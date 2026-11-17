@extends('layouts.app')

@section('no_sidebar', true)

@section('title', ($document->title ?: 'Untitled Document') . ' - PDF Editor')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    <style>
        body,
        .editor-header,
        .editor-sidebar,
        .sidebar-title,
        .panel,
        .panel h3,
        .panel label,
        .panel select,
        .panel input,
        .panel button,
        .btn,
        .format-buttons button {
            font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        }

        body {
            background-color: #f1f5f9;
        }

        .editor-header {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0 24px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .editor-header .brand {
            font-size: 1.15rem;
            font-weight: 700;
            color: #0f172a;
        }

        .editor-header .btn {
            background-color: #ffffff;
            border: 1px solid #cbd5e1;
            color: #0f172a;
            font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
            font-weight: 500;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.875rem;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .editor-header .btn:hover:not(:disabled) {
            background-color: #2563eb !important;
            border-color: #2563eb !important;
            color: #ffffff !important;
        }

        .editor-header .btn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

        .editor-header .btn-primary {
            background-color: #2563eb !important;
            border-color: #2563eb !important;
            color: #ffffff !important;
            font-weight: 600;
        }

        .editor-header .btn-primary:hover:not(:disabled) {
            background-color: #1d4ed8 !important;
            border-color: #1d4ed8 !important;
            color: #ffffff !important;
        }

        .editor-sidebar {
            background: #ffffff;
            border-right: 1px solid #e2e8f0;
            width: 280px;
            padding: 24px 20px;
        }

        .sidebar-title {
            color: #0f172a;
            font-weight: 700;
            font-size: 1rem;
            margin-bottom: 24px;
        }

        .panel {
            margin-bottom: 24px;
        }

        .panel h3 {
            color: #475569;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
        }

        .panel label {
            color: #334155;
            font-size: 0.8rem;
            font-weight: 600;
            margin: 10px 0 5px;
            display: block;
        }

        .panel select,
        .panel input[type="number"],
        .panel input[type="color"] {
            font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            color: #0f172a;
            padding: 8px 10px;
            font-size: 0.875rem;
            width: 100%;
        }

        .panel select:focus,
        .panel input[type="number"]:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
            outline: none;
        }

        .panel button {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            background: #ffffff;
            color: #0f172a;
            font-weight: 500;
            transition: all 0.2s ease;
            width: 100%;
            padding: 10px 14px;
            margin-bottom: 8px;
            font-size: 0.875rem;
            text-align: left;
            cursor: pointer;
        }

        .panel button:hover {
            background-color: #2563eb !important;
            border-color: #2563eb !important;
            color: #ffffff !important;
        }

        .format-buttons button {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            background: #ffffff;
            color: #0f172a;
            font-weight: 600;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .format-buttons button:hover,
        .format-buttons button.active {
            background-color: #2563eb !important;
            border-color: #2563eb !important;
            color: #ffffff !important;
        }
    </style>
@endsection

@section('content')

    <header class="editor-header">
        <div class="brand">
            PDF Editor
        </div>

        <div class="header-actions">
            <a href="{{ route('documents.index') }}" class="btn btn-sm">
                Back
            </a>

            <button class="btn btn-sm" type="button" id="undoBtn" title="Undo (Ctrl+Z)">Undo</button>
            <button class="btn btn-sm" type="button" id="redoBtn" title="Redo (Ctrl+Y)">Redo</button>

            <button class="btn btn-sm" type="button" id="printDocumentBtn">
                Print / PDF
            </button>

            <button class="btn btn-sm btn-primary" type="button" id="saveDocumentBtn">
                Save
            </button>
        </div>
    </header>

    <input type="hidden" id="documentTitle" value="{{ old('title', $document->title ?? 'Untitled Document') }}">
    <input type="hidden" id="csrfToken" value="{{ csrf_token() }}">

    <div class="editor-workspace">

        <aside class="editor-sidebar">

            <div class="sidebar-title">Editor Settings</div>

            <div class="panel">
                <h3>Page Settings</h3>

                <label>Page Size</label>
                <select id="pageSize">
                    <option value="A4">A4</option>
                </select>

                <label>Orientation</label>
                <select id="orientation">
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                </select>

                <label>Top Margin (mm)</label>
                <input type="number" id="marginTop" value="25">

                <label>Bottom Margin (mm)</label>
                <input type="number" id="marginBottom" value="25">

                <label>Left Margin (mm)</label>
                <input type="number" id="marginLeft" value="20">

                <label>Right Margin (mm)</label>
                <input type="number" id="marginRight" value="20">

                <label>Padding (mm)</label>
                <input type="number" id="pagePadding" value="10">

                <label>Background</label>
                <input type="color" id="pageBackground" value="#FFFFFF">
            </div>

            <div class="panel">
                <h3>Add Content</h3>

                <button type="button" id="addHeading">+ Add Heading</button>
                <button type="button" id="addParagraph">+ Add Paragraph</button>
                <button type="button" id="addImage">+ Add Image</button>

                <input type="file" id="imageInput" accept="image/*" hidden>
            </div>

            <div class="panel">
                <h3>Text Formatting</h3>

                <label>Font Family</label>
                <select id="fontFamily">
                    <option value="Inter">Inter</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                </select>

                <label>Font Size</label>
                <input type="number" id="fontSize" value="14" min="8" max="72">

                <label>Text Color</label>
                <input type="color" id="textColor" value="#0f172a">

                <div class="format-buttons">
                    <button type="button" id="boldBtn"><b>B</b></button>
                    <button type="button" id="italicBtn"><i>I</i></button>
                    <button type="button" id="underlineBtn"><u>U</u></button>
                </div>

                <label>Alignment</label>
                <select id="textAlignment">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                </select>
            </div>

        </aside>

        <main class="editor-canvas">
            <div class="page-area">

                <div class="pages-container" id="pagesContainer"
                    data-save-url="{{ route('documents.update', $document->id) }}"
                    data-image-upload-url="{{ route('documents.images.upload', $document->id) }}"
                    data-document-content="{{ json_encode($document->content ?? []) }}"
                    data-document-settings="{{ json_encode($document->settings ?? []) }}">

                    <div class="a4-page" id="a4Page">
                        <div class="document-content" id="documentContent">

                            <div id="contentBlocks"></div>

                        </div>
                    </div>

                </div>

            </div>
        </main>

    </div>

@endsection

@section('scripts')
    <script src="{{ asset('js/document-editor.js') }}"></script>
@endsection
