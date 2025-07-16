window.addEventListener('DOMContentLoaded', () => {
  renderTable();
});

let selectedFiles = [];

async function renderTable() {
  const res = await apiFetch('/exhibits');
  if (!res) return;

  const data = await res.json();
  const exhibits = data?.items || [];
  const tableBody = document.getElementById('exibits-container');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  exhibits.forEach((exhibit) => {
    const row = document.createElement('tr');
    row.className = 'info-container';
    row.dataset.id = exhibit.id;
    row.innerHTML = `
      <td>${exhibit.title || ''}</td>
      <td class="circles-btns">
        <div class="circle-btn editing"><i class="bi bi-pencil"></i></div>
        <div class="circle-btn delete"><i class="bi bi-trash"></i></div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

document.getElementById('exibits-container')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.circle-btn');
  if (!btn) return;

  const exhibitId = btn.closest('.info-container')?.dataset.id;
  if (!exhibitId) return;

  if (btn.classList.contains('editing')) editExhibitInfo(exhibitId);
  if (btn.classList.contains('delete'))  deleteExhibit(exhibitId);
});

async function editExhibitInfo(id) {
  const res = await apiFetch(`/exhibits/${id}`);
  if (!res) return;

  const exhibit = await res.json();

  const translations = exhibit.translations || [];
  const t = translations.find((tr) => tr.locale === 'ua') || translations[0] || {};

  document.getElementById('editExibitsname').value    = exhibit.title    ?? t.title ?? '';
  document.getElementById('editDescription').value    = t.description    ?? '';
  document.getElementById('editCreationPeriod').value = t.creationPeriod ?? '';
  document.getElementById('editAuthor').value         = t.author         ?? '';
  document.getElementById('editMaterials').value      = t.materials      ?? '';
  document.getElementById('editCreationMethod').value = t.creationMethod ?? '';
  document.getElementById('editFact').value           = t.fact           ?? '';
  document.getElementById('editLocation').value       = t.location       ?? '';
  document.getElementById('editOwner').value          = t.owner          ?? '';

  const modelUrlEl = document.getElementById('model_url_link');
  if (modelUrlEl) modelUrlEl.textContent = exhibit.modelUrl ?? '';

  const container = document.getElementById('existingPhotoPreview');
  if (container) {
    container.innerHTML = '';
    let existingIds = (exhibit.images || []).map((img) => img.id);

    let hiddenInput = document.getElementById('existingPhotoIds');
    if (!hiddenInput) {
      hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.id = 'existingPhotoIds';
      hiddenInput.name = 'existingPhotoIds';
      container.after(hiddenInput);
    }
    hiddenInput.value = JSON.stringify(existingIds);

    (exhibit.images || []).forEach((image) => {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:inline-block;position:relative;margin-right:8px;margin-bottom:8px;';

      const img = document.createElement('img');
      img.src = image.imageUrl;
      img.style.cssText = 'width:200px;height:auto;object-fit:cover;border:1px solid #ccc;border-radius:8px;';

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.style.cssText = 'position:absolute;top:5px;right:5px;background:red;color:#fff;border:none;border-radius:50%;cursor:pointer;width:24px;height:24px;';
      removeBtn.addEventListener('click', () => {
        wrapper.remove();
        existingIds = existingIds.filter((imgId) => imgId !== image.id);
        hiddenInput.value = JSON.stringify(existingIds);
      });

      wrapper.appendChild(img);
      wrapper.appendChild(removeBtn);
      container.appendChild(wrapper);
    });
  }

  const modalEl = document.getElementById('editExibitsModal');
  const editModal = new bootstrap.Modal(modalEl);
  editModal.show();

  const btn = document.getElementById('editExibitsBtn');
  const newBtn = btn.cloneNode(true);
  btn.replaceWith(newBtn);

  newBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title',          document.getElementById('editExibitsname').value);
    formData.append('description',    document.getElementById('editDescription').value);
    formData.append('creationPeriod', document.getElementById('editCreationPeriod').value);
    formData.append('author',         document.getElementById('editAuthor').value);
    formData.append('materials',      document.getElementById('editMaterials').value);
    formData.append('creationMethod', document.getElementById('editCreationMethod').value);
    formData.append('fact',           document.getElementById('editFact').value);
    formData.append('location',       document.getElementById('editLocation').value);
    formData.append('owner',          document.getElementById('editOwner').value);

    const existingIds = JSON.parse(document.getElementById('existingPhotoIds')?.value || '[]');
    existingIds.forEach((photoId) => formData.append('existingPhotoIds[]', photoId));

    selectedFiles.forEach((file) => formData.append('images', file));

    const modelFile = document.getElementById('editModelUrl')?.files[0];
    if (modelFile) formData.append('model', modelFile);

    const res = await apiFetch(`/exhibits/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (res?.ok) {
      selectedFiles = [];
      editModal.hide();
      renderTable();
    }
  });
}

async function deleteExhibit(exhibitId) {
  const res = await apiFetch(`/exhibits/${exhibitId}`, { method: 'DELETE' });
  if (res?.ok) renderTable();
}

document.getElementById('addExibitsTrigger')?.addEventListener('click', () => {
  new bootstrap.Modal(document.getElementById('createExibitsModal')).show();
});

document.getElementById('createExibitsBtn')?.addEventListener('click', async () => {
  const formData = new FormData();
  formData.append('title',          document.getElementById('createExibitsname').value.trim());
  formData.append('description',    document.getElementById('createDescription').value);
  formData.append('creationPeriod', document.getElementById('createCreationPeriod').value);
  formData.append('author',         document.getElementById('createAuthor').value);
  formData.append('materials',      document.getElementById('createMaterials').value);
  formData.append('creationMethod', document.getElementById('createCreationMethod').value);
  formData.append('fact',           document.getElementById('createFact').value);
  formData.append('location',       document.getElementById('createLocation').value);
  formData.append('owner',          document.getElementById('createOwner').value);

  selectedFiles.forEach((file) => formData.append('images', file));

  const modelFile = document.getElementById('createModelUrl')?.files[0];
  if (modelFile) formData.append('model', modelFile);

  const res = await apiFetch('/exhibits', { method: 'POST', body: formData });

  if (res?.ok) {
    ['createExibitsname', 'createDescription', 'createModelUrl', 'createCreationPeriod',
     'createAuthor', 'createMaterials', 'createCreationMethod', 'createFact',
     'createLocation', 'createOwner'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    selectedFiles = [];
    document.getElementById('createPhotoPreview')?.replaceChildren();
    bootstrap.Modal.getInstance(document.getElementById('createExibitsModal'))?.hide();
    renderTable();
  }
});

function setupPhotoInput(inputId, previewId) {
  document.getElementById(inputId)?.addEventListener('change', function () {
    const files = Array.from(this.files);
    selectedFiles = selectedFiles.concat(files);

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:inline-block;position:relative;margin-right:8px;margin-bottom:8px;';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.cssText = 'width:200px;height:auto;object-fit:cover;border:1px solid #ccc;border-radius:8px;';

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.style.cssText = 'position:absolute;top:5px;right:5px;background:red;color:#fff;border:none;border-radius:50%;cursor:pointer;width:24px;height:24px;';
        removeBtn.addEventListener('click', () => {
          wrapper.remove();
          selectedFiles = selectedFiles.filter((f) => f !== file);
        });

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        document.getElementById(previewId)?.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    });

    this.value = '';
  });
}

setupPhotoInput('createPhotos', 'createPhotoPreview');
setupPhotoInput('editPhotos',   'existingPhotoPreview');