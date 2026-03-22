// Create Post – drag and drop + preview
(function () {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const previewArea = document.getElementById('previewArea');

  if (!dropZone || !fileInput || !previewArea) return;

  // Drag events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  window.handleFiles = function (files) {
    if (!files || files.length === 0) return;

    // Clear placeholder text
    const placeholder = previewArea.querySelector('.preview-placeholder-text');
    if (placeholder) placeholder.remove();

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.className = 'preview-thumb';
          img.alt = file.name;
          previewArea.appendChild(img);
        };
        reader.readAsDataURL(file);
      } else {
        // Video – show file name
        const tag = document.createElement('span');
        tag.style.cssText = 'font-size:12px;color:#6b7280;padding:4px 8px;background:#e5e7e2;border-radius:4px;';
        tag.textContent = '🎥 ' + file.name;
        previewArea.appendChild(tag);
      }
    });
  };
})();
