document.addEventListener('DOMContentLoaded', function () {

    // =====================================
    // PAGE ELEMENTS
    // =====================================

    const pagesContainer = document.getElementById('pagesContainer');
    const firstPage = document.getElementById('a4Page');
    const firstBlocks = document.getElementById('contentBlocks');

    const documentTitle = document.getElementById('documentTitle');

    const orientation = document.getElementById('orientation');
    const marginTop = document.getElementById('marginTop');
    const marginBottom = document.getElementById('marginBottom');
    const marginLeft = document.getElementById('marginLeft');
    const marginRight = document.getElementById('marginRight');
    const padding = document.getElementById('pagePadding');
    const background = document.getElementById('pageBackground');

    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const textColor = document.getElementById('textColor');
    const textAlignment = document.getElementById('textAlignment');

    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');

    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    const addHeading = document.getElementById('addHeading');
    const addParagraph = document.getElementById('addParagraph');
    const addImage = document.getElementById('addImage');
    const imageInput = document.getElementById('imageInput');

    const saveButton = document.getElementById('saveDocumentBtn');
    const csrfToken = document.getElementById('csrfToken').value;

    let selectedBlock = null;
    let saveTimeout = null;
    let reflowTimeout = null;
    let historyTimeout = null;
    let isSaving = false;
    let savePending = false;

    // =====================================
    // UNDO / REDO HISTORY
    // =====================================

    let historyStack = [];
    let historyIndex = -1;
    const MAX_HISTORY = 40;
    let isUndoRedoAction = false;

    function getDocumentSnapshot() {
        return {
            title: documentTitle ? documentTitle.value : '',
            content: getDocumentContent(),
            settings: getPageSettings()
        };
    }

    function updateUndoRedoUI() {
        if (undoBtn) {
            undoBtn.disabled = (historyIndex <= 0);
            undoBtn.style.opacity = (historyIndex <= 0) ? '0.45' : '1';
        }
        if (redoBtn) {
            redoBtn.disabled = (historyIndex >= historyStack.length - 1);
            redoBtn.style.opacity = (historyIndex >= historyStack.length - 1) ? '0.45' : '1';
        }
    }

    function pushHistoryState() {
        if (isUndoRedoAction) return;

        const snapshot = getDocumentSnapshot();
        const snapshotStr = JSON.stringify(snapshot);

        if (historyIndex >= 0 && JSON.stringify(historyStack[historyIndex]) === snapshotStr) {
            return;
        }

        historyStack = historyStack.slice(0, historyIndex + 1);
        historyStack.push(snapshot);

        if (historyStack.length > MAX_HISTORY) {
            historyStack.shift();
        } else {
            historyIndex++;
        }

        updateUndoRedoUI();
    }

    function scheduleHistoryPush() {
        clearTimeout(historyTimeout);
        historyTimeout = setTimeout(function () {
            pushHistoryState();
        }, 500);
    }

    function applyHistoryState(state) {
        if (!state) return;

        isUndoRedoAction = true;

        try {
            if (documentTitle && state.title) {
                documentTitle.value = state.title;
                document.title = state.title + ' - PDF Editor';
            }

            if (state.settings) {
                orientation.value = state.settings.orientation || 'portrait';
                marginTop.value = state.settings.margin_top ?? 25;
                marginBottom.value = state.settings.margin_bottom ?? 25;
                marginLeft.value = state.settings.margin_left ?? 20;
                marginRight.value = state.settings.margin_right ?? 20;
                padding.value = state.settings.padding ?? 10;
                background.value = state.settings.background || '#FFFFFF';
                applyPageSettings();
            }

            pagesContainer.querySelectorAll('.a4-page').forEach(function (page) {
                if (page !== firstPage) {
                    page.remove();
                }
            });

            firstBlocks.replaceChildren();
            selectedBlock = null;

            if (Array.isArray(state.content)) {
                state.content.forEach(function (item) {
                    if (item.type === 'heading' || item.type === 'paragraph') {
                        addBlock(item.type, item.text || '', item.style || {});
                    } else if (item.type === 'image' && item.src) {
                        addBlock('image', item.src, item.style || {});
                    }
                });
            }

            reflowPages();
            scheduleAutoSave();

        } finally {
            isUndoRedoAction = false;
            updateUndoRedoUI();
        }
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            applyHistoryState(historyStack[historyIndex]);
        }
    }

    function redo() {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            applyHistoryState(historyStack[historyIndex]);
        }
    }

    if (undoBtn) {
        undoBtn.addEventListener('click', function () {
            undo();
        });
    }

    if (redoBtn) {
        redoBtn.addEventListener('click', function () {
            redo();
        });
    }

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            if (e.shiftKey) {
                e.preventDefault();
                redo();
            } else {
                e.preventDefault();
                undo();
            }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            redo();
        }
    });

    // =====================================
    // DOCUMENT TITLE
    // =====================================

    if (documentTitle) {
        if (documentTitle.value) {
            document.title = documentTitle.value + ' - PDF Editor';
        }

        if (documentTitle.type !== 'hidden') {
            documentTitle.addEventListener('input', function () {
                document.title = (documentTitle.value || 'Untitled Document') + ' - PDF Editor';
                scheduleAutoSave();
                scheduleHistoryPush();
            });
        }
    }

    // =====================================
    // PAGE SETTINGS
    // =====================================

    function applyPageSettings() {
        const isLandscape = orientation.value === 'landscape';
        const pages = pagesContainer.querySelectorAll('.a4-page');

        pages.forEach(function (page) {
            page.classList.toggle('landscape', isLandscape);

            const content = page.querySelector('.document-content');
            if (content) {
                content.style.padding =
                    `${marginTop.value}mm ${marginRight.value}mm ${marginBottom.value}mm ${marginLeft.value}mm`;
                content.style.paddingBottom =
                    `calc(${marginBottom.value}mm + ${padding.value}mm)`;
                content.style.backgroundColor = background.value;
            }
        });
    }

    const pageControls = [
        orientation,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        padding,
        background
    ];

    pageControls.forEach(function (control) {
        control.addEventListener('input', function () {
            applyPageSettings();
            scheduleReflow();
            scheduleAutoSave();
            scheduleHistoryPush();
        });

        control.addEventListener('change', function () {
            applyPageSettings();
            reflowPages();
            scheduleAutoSave();
            pushHistoryState();
        });
    });

    // =====================================
    // CREATE NEW A4 PAGE
    // =====================================

    function createPage() {
        const page = document.createElement('div');
        page.classList.add('a4-page');

        const content = document.createElement('div');
        content.classList.add('document-content');

        const blocks = document.createElement('div');
        blocks.classList.add('content-blocks');

        content.appendChild(blocks);
        page.appendChild(content);
        pagesContainer.appendChild(page);

        applyPageSettings();

        return {
            page: page,
            blocks: blocks
        };
    }

    // =====================================
    // GET ALL BLOCKS
    // =====================================

    function getAllBlocks() {
        return Array.from(
            pagesContainer.querySelectorAll('.content-block')
        );
    }

    // =====================================
    // AUTOMATIC PAGE BREAKS (SMOOTH & NON-DESTRUCTIVE)
    // =====================================

    function scheduleReflow() {
        clearTimeout(reflowTimeout);
        reflowTimeout = setTimeout(function () {
            reflowPages();
        }, 400);
    }

    function reflowPages() {
        const blocks = getAllBlocks();
        if (blocks.length === 0) return;

        const activeEl = document.activeElement;
        const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        const selStart = isInput ? activeEl.selectionStart : null;
        const selEnd = isInput ? activeEl.selectionEnd : null;

        const pages = pagesContainer.querySelectorAll('.a4-page');
        const pageBottom = firstPage.getBoundingClientRect().bottom;
        const contentStyle = window.getComputedStyle(firstPage.querySelector('.document-content'));
        const bottomPadding = parseFloat(contentStyle.paddingBottom) || 0;
        const availableBottom = pageBottom - bottomPadding;

        if (pages.length === 1) {
            const lastBlock = blocks[blocks.length - 1];
            if (lastBlock.getBoundingClientRect().bottom <= availableBottom) {
                return;
            }
        }

        pages.forEach(function (page) {
            if (page !== firstPage) {
                page.remove();
            }
        });

        blocks.forEach(function (block) {
            if (block.parentElement !== firstBlocks) {
                firstBlocks.appendChild(block);
            }
        });

        let currentPage = firstPage;
        let currentBlocks = firstBlocks;

        blocks.forEach(function (block) {
            const curBottom = currentPage.getBoundingClientRect().bottom;
            const cStyle = window.getComputedStyle(currentPage.querySelector('.document-content'));
            const bPadding = parseFloat(cStyle.paddingBottom) || 0;
            const availBottom = curBottom - bPadding;
            const blockBottom = block.getBoundingClientRect().bottom;

            if (blockBottom > availBottom && currentBlocks.children.length > 1) {
                const newPage = createPage();
                currentPage = newPage.page;
                currentBlocks = newPage.blocks;
                currentBlocks.appendChild(block);
            }
        });

        if (activeEl && isInput && activeEl.isConnected) {
            activeEl.focus();
            if (selStart !== null && selEnd !== null) {
                try {
                    activeEl.setSelectionRange(selStart, selEnd);
                } catch (e) {}
            }
        }

        if (selectedBlock && selectedBlock.isConnected) {
            selectedBlock.classList.add('selected');
        }
    }

    // =====================================
    // SELECT BLOCK
    // =====================================

    function selectBlock(block) {
        document.querySelectorAll('.content-block').forEach(function (item) {
            item.classList.remove('selected');
        });

        block.classList.add('selected');
        selectedBlock = block;

        const element = block.querySelector('input, textarea');

        if (element) {
            fontFamily.value = element.style.fontFamily || 'Inter';

            fontSize.value = parseInt(element.style.fontSize) ||
                (element.classList.contains('heading-block') ? 24 : 14);

            textColor.value = element.style.color || '#0f172a';
            textAlignment.value = element.style.textAlign || 'left';

            boldBtn.classList.toggle('active', element.style.fontWeight === 'bold');
            italicBtn.classList.toggle('active', element.style.fontStyle === 'italic');
            underlineBtn.classList.toggle('active', (element.style.textDecoration || '').includes('underline'));
        } else {
            boldBtn.classList.remove('active');
            italicBtn.classList.remove('active');
            underlineBtn.classList.remove('active');
        }
    }

    // =====================================
    // REORDER BLOCKS
    // =====================================

    function moveBlock(block, direction) {
        const blocks = getAllBlocks();
        const index = blocks.indexOf(block);
        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= blocks.length) {
            return;
        }

        const temp = blocks[index];
        blocks[index] = blocks[newIndex];
        blocks[newIndex] = temp;

        blocks.forEach(function (item) {
            firstBlocks.appendChild(item);
        });

        reflowPages();
        selectBlock(block);
        scheduleAutoSave();
        pushHistoryState();
    }

    // =====================================
    // ADD CONTENT BLOCK
    // =====================================

    function addBlock(type, value = '', style = {}) {
        const block = document.createElement('div');
        block.classList.add('content-block');

        block.addEventListener('click', function () {
            selectBlock(block);
        });

        if (type === 'heading') {
            const heading = document.createElement('input');
            heading.type = 'text';
            heading.placeholder = 'Enter heading...';
            heading.classList.add('heading-block');
            heading.value = value;
            block.appendChild(heading);
        } else if (type === 'paragraph') {
            const paragraph = document.createElement('textarea');
            paragraph.placeholder = 'Write your paragraph...';
            paragraph.classList.add('paragraph-block');
            paragraph.value = value;
            block.appendChild(paragraph);
        } else if (type === 'image') {
            const image = document.createElement('img');
            image.src = value;
            image.classList.add('image-block');
            image.addEventListener('load', reflowPages);
            block.appendChild(image);
        }

        // Apply saved text formatting
        const textElement = block.querySelector('input, textarea');

        if (textElement) {
            textElement.style.fontFamily = style.fontFamily || '';
            textElement.style.fontSize = style.fontSize || '';
            textElement.style.color = style.color || '';
            textElement.style.textAlign = style.textAlign || '';
            textElement.style.fontWeight = style.fontWeight || '';
            textElement.style.fontStyle = style.fontStyle || '';
            textElement.style.textDecoration = style.textDecoration || '';

            textElement.addEventListener('input', function () {
                scheduleAutoSave();
                scheduleHistoryPush();
                scheduleReflow();
            });

            textElement.addEventListener('change', function () {
                scheduleAutoSave();
                pushHistoryState();
                reflowPages();
            });
        }

        // =================================
        // BLOCK ACTIONS
        // =================================

        const actions = document.createElement('div');
        actions.classList.add('block-actions');

        const upButton = document.createElement('button');
        upButton.type = 'button';
        upButton.textContent = 'Move Up';
        upButton.addEventListener('click', function (event) {
            event.stopPropagation();
            moveBlock(block, -1);
        });

        const downButton = document.createElement('button');
        downButton.type = 'button';
        downButton.textContent = 'Move Down';
        downButton.addEventListener('click', function (event) {
            event.stopPropagation();
            moveBlock(block, 1);
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('block-delete');
        deleteButton.addEventListener('click', function (event) {
            event.stopPropagation();
            block.remove();

            if (selectedBlock === block) {
                selectedBlock = null;
            }

            reflowPages();
            scheduleAutoSave();
            pushHistoryState();
        });

        actions.appendChild(upButton);
        actions.appendChild(downButton);
        actions.appendChild(deleteButton);
        block.appendChild(actions);

        firstBlocks.appendChild(block);
        selectBlock(block);
        scheduleReflow();
    }

    // =====================================
    // LOAD SAVED DOCUMENT
    // =====================================

    const savedContent = JSON.parse(
        pagesContainer.dataset.documentContent || '[]'
    );

    const savedSettings = JSON.parse(
        pagesContainer.dataset.documentSettings || '{}'
    );

    orientation.value = savedSettings.orientation || 'portrait';
    marginTop.value = savedSettings.margin_top ?? 25;
    marginBottom.value = savedSettings.margin_bottom ?? 25;
    marginLeft.value = savedSettings.margin_left ?? 20;
    marginRight.value = savedSettings.margin_right ?? 20;
    padding.value = savedSettings.padding ?? 10;
    background.value = savedSettings.background || '#FFFFFF';

    savedContent.forEach(function (item) {
        if (item.type === 'heading' || item.type === 'paragraph') {
            addBlock(item.type, item.text || '', item.style || {});
        }
        if (item.type === 'image' && item.src) {
            addBlock('image', item.src, item.style || {});
        }
    });

    applyPageSettings();
    reflowPages();
    pushHistoryState();

    // =====================================
    // ADD BUTTON EVENTS
    // =====================================

    addHeading.addEventListener('click', function () {
        addBlock('heading');
        scheduleAutoSave();
        pushHistoryState();
    });

    addParagraph.addEventListener('click', function () {
        addBlock('paragraph');
        scheduleAutoSave();
        pushHistoryState();
    });

    addImage.addEventListener('click', function () {
        imageInput.click();
    });

    imageInput.addEventListener('change', async function () {
        const file = imageInput.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image.');
            imageInput.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            addImage.disabled = true;
            addImage.textContent = 'Uploading...';

            const response = await fetch(
                pagesContainer.dataset.imageUploadUrl,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: formData
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Image upload failed.');
            }

            addBlock('image', result.url);
            scheduleAutoSave();
            pushHistoryState();

        } catch (error) {
            console.error('Image upload error:', error);
            alert(error.message);
        } finally {
            addImage.disabled = false;
            addImage.textContent = '+ Add Image';
            imageInput.value = '';
        }
    });

    // =====================================
    // TEXT FORMATTING
    // =====================================

    function getSelectedTextElement() {
        if (!selectedBlock) {
            alert('Please select a heading or paragraph first.');
            return null;
        }

        const element = selectedBlock.querySelector('input, textarea');
        if (!element) {
            alert('Text formatting is only available for text blocks.');
            return null;
        }

        return element;
    }

    function applyFormatting(property, value) {
        const element = getSelectedTextElement();
        if (element) {
            element.style[property] = value;
            scheduleReflow();
            scheduleAutoSave();
            pushHistoryState();
        }
    }

    fontFamily.addEventListener('change', function () {
        applyFormatting('fontFamily', fontFamily.value);
    });

    fontSize.addEventListener('change', function () {
        const size = Number(fontSize.value);
        if (!Number.isFinite(size) || size < 8 || size > 72) {
            alert('Font size must be between 8 and 72.');
            return;
        }
        applyFormatting('fontSize', size + 'px');
    });

    textColor.addEventListener('input', function () {
        applyFormatting('color', textColor.value);
    });

    textAlignment.addEventListener('change', function () {
        applyFormatting('textAlign', textAlignment.value);
    });

    function toggleFormat(button, property, value) {
        const element = getSelectedTextElement();
        if (!element) return;

        const isActive = button.classList.toggle('active');

        if (property === 'textDecoration') {
            element.style[property] = isActive ? value : 'none';
        } else {
            element.style[property] = isActive ? value : 'normal';
        }

        scheduleReflow();
        scheduleAutoSave();
        pushHistoryState();
    }

    boldBtn.addEventListener('click', function () {
        toggleFormat(boldBtn, 'fontWeight', 'bold');
    });

    italicBtn.addEventListener('click', function () {
        toggleFormat(italicBtn, 'fontStyle', 'italic');
    });

    underlineBtn.addEventListener('click', function () {
        toggleFormat(underlineBtn, 'textDecoration', 'underline');
    });

    // =====================================
    // AUTO SAVE
    // =====================================

    function getDocumentContent() {
        return getAllBlocks().map(function (block) {
            const textElement = block.querySelector('input, textarea');
            const imageElement = block.querySelector('img');

            if (imageElement) {
                return {
                    type: 'image',
                    src: imageElement.src,
                    style: {}
                };
            }

            return {
                type: textElement.classList.contains('heading-block')
                    ? 'heading'
                    : 'paragraph',
                text: textElement.value,
                style: {
                    fontFamily: textElement.style.fontFamily,
                    fontSize: textElement.style.fontSize,
                    color: textElement.style.color,
                    textAlign: textElement.style.textAlign,
                    fontWeight: textElement.style.fontWeight,
                    fontStyle: textElement.style.fontStyle,
                    textDecoration: textElement.style.textDecoration
                }
            };
        });
    }

    function getPageSettings() {
        return {
            page_size: 'A4',
            orientation: orientation.value,
            margin_top: Number(marginTop.value),
            margin_bottom: Number(marginBottom.value),
            margin_left: Number(marginLeft.value),
            margin_right: Number(marginRight.value),
            padding: Number(padding.value),
            background: background.value
        };
    }

    async function saveDocument() {
        if (isSaving) {
            savePending = true;
            return;
        }

        const payload = {
            title: documentTitle ? documentTitle.value.trim() || 'Untitled Document' : 'Untitled Document',
            content: getDocumentContent(),
            settings: getPageSettings()
        };

        isSaving = true;

        if (saveButton) {
            saveButton.textContent = 'Saving...';
        }

        try {
            const response = await fetch(pagesContainer.dataset.saveUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Could not save document.');
            }

            if (saveButton) {
                saveButton.textContent = 'Saved';
            }

        } catch (error) {
            console.error('Document save error:', error);
            if (saveButton) {
                saveButton.textContent = 'Save Failed';
            }
        } finally {
            isSaving = false;

            if (savePending) {
                savePending = false;
                saveDocument();
            } else {
                setTimeout(function () {
                    if (saveButton) {
                        saveButton.textContent = 'Save';
                    }
                }, 1500);
            }
        }
    }

    function scheduleAutoSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(function () {
            saveDocument();
        }, 2000);
    }

    if (saveButton) {
        saveButton.addEventListener('click', function () {
            clearTimeout(saveTimeout);
            saveDocument();
        });
    }

    // =====================================
    // PRINT DOCUMENT
    // =====================================

    const printButton = document.getElementById('printDocumentBtn');

    if (printButton) {
        printButton.addEventListener('click', async function () {
            clearTimeout(saveTimeout);
            await saveDocument();

            const printStyle = document.createElement('style');
            printStyle.id = 'dynamicPrintOrientation';
            const selectedOrientation = orientation.value;

            printStyle.textContent = `
                @media print {
                    @page {
                        size: A4 ${selectedOrientation};
                        margin: 0;
                    }
                    .document-title {
                        display: none !important;
                    }
                }
            `;

            document.head.appendChild(printStyle);
            window.print();
            printStyle.remove();
        });
    }

    // =====================================
    // INITIALIZE
    // =====================================

    applyPageSettings();
    reflowPages();
    updateUndoRedoUI();

});
