# 📄 PDF Editor - Web-Based Document Designer

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A lightweight, full-stack web-based document designer built with **Laravel**, **Vanilla JavaScript (DOM Engine)**, and **Bootstrap 5.3**. Create, design, format, and export professional A4 documents and PDFs directly from your browser with real-time auto-saving and automatic multi-page breaks.

---

## 🌐 Live Demo
🔗 **Live Application:** [https://pdf-editor.freedev.app/](https://pdf-editor.freedev.app/)  
*(Note: Replace with your active hosting URL if different)*

---

## ✨ Key Features

- **🎨 Interactive A4 Canvas:** Real-world A4 page simulation (794px × 1123px) with configurable margins (mm), padding, orientation (Portrait/Landscape), and page background colors.
- **📝 Rich Content Blocks:** Add custom headings, paragraphs, and high-resolution images dynamically.
- **🔤 Advanced Typography:** Real-time font family switching (*Inter, Plus Jakarta Sans, Arial, Georgia, Times New Roman*), font sizing, colors, alignment (Left, Center, Right, Justify), and text styles (Bold, Italic, Underline).
- **📄 Automatic Multi-Page Breaks (Reflow Engine):** Intelligent overflow detection that automatically generates additional A4 pages when content exceeds page bounds without interrupting active typing.
- **⚡ Non-Blocking Real-Time Auto-Save:** Background AJAX serialization saves document content and settings in a flexible JSON format without page reloads.
- **🔄 Full Undo / Redo History Stack:** Comprehensive state snapshots with full keyboard shortcut support (`Ctrl + Z` for Undo, `Ctrl + Y` / `Ctrl + Shift + Z` for Redo).
- **🖨️ Instant PDF Export & Print:** Print-specific CSS injected on the fly for pristine 1:1 A4 PDF downloads via browser native print preview.
- **📂 Clean Dashboard & Modal Creation:** Minimalist user workspace with document metrics, recent activity table, and quick modal-based document creation.

---

## 🛠️ Tech Stack & Architecture

- **Backend:** Laravel 11.x (MVC, Eloquent ORM, RESTful Controllers, Middleware)
- **Database:** MySQL (Structured tables with dynamic JSON columns for content and styling)
- **Frontend:** Blade Templates, Bootstrap 5.3, Inter Google Font
- **Client Engine:** Pure Vanilla JavaScript (Zero bloated third-party rich-text dependencies)
- **Storage:** Local disk driver with symbolic link for uploaded media

---

## 🚀 Getting Started Locally

### Prerequisites
- PHP >= 8.2
- Composer
- MySQL (XAMPP / Laragon / Native)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abdullahkhanathitms/web-based-pdf-editor.git
   cd web-based-pdf-editor
   ```

2. **Install Composer dependencies:**
   ```bash
   composer install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
   Set up your MySQL database credentials in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=project_3rd
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Generate Application Key:**
   ```bash
   php artisan key:generate
   ```

5. **Run Migrations:**
   ```bash
   php artisan migrate
   ```

6. **Create Storage Symlink:**
   ```bash
   php artisan storage:link
   ```

7. **Start Development Server:**
   ```bash
   php artisan serve
   ```
   Visit: `http://127.0.0.1:8000`

---

## 📁 Project Structure

```plaintext
app/
 ├── Http/Controllers/
 │    ├── AuthController.php       # Authentication logic (Register, Login, Logout)
 │    ├── DashboardController.php  # User document stats & recent files
 │    └── DocumentController.php   # Document CRUD, JSON updates, image uploads
 └── Models/
      ├── Document.php             # Document model with JSON casts
      └── User.php                 # User model with document relationships
resources/
 └── views/
      ├── auth/                    # Clean Spatie-inspired Login & Register views
      ├── documents/
      │    ├── editor.blade.php    # A4 Canvas and styling toolbar
      │    └── index.blade.php     # Document library list
      ├── dashboard.blade.php      # Main dashboard with modal creation
      └── layouts/app.blade.php    # Master layout with responsive sidebar
public/
 ├── js/document-editor.js         # Core editor DOM engine (Reflow, Undo/Redo, Auto-save)
 └── css/app.css                   # A4 dimensions, print queries, and UI components
```

---

## 👨‍💻 Author

**Abdullah Khan**  
- **GitHub:** [@abdullahkhanathitms](https://github.com/abdullahkhanathitms)  
- **Project Repository:** [web-based-pdf-editor](https://github.com/abdullahkhanathitms/web-based-pdf-editor)

---

## 📄 License

This project is open-sourced software licensed under the [MIT License](LICENSE).
