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

    const transfer = new DataTransfer();
    Array.from(e.dataTransfer.files).forEach((file) => transfer.items.add(file));
    fileInput.files = transfer.files;
    handleFiles(fileInput.files);
  });

  window.handleFiles = function (files) {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;

    previewArea.innerHTML = '';

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
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.className = 'preview-thumb';
      video.controls = true;
      previewArea.appendChild(video);
    }
  };
})();
