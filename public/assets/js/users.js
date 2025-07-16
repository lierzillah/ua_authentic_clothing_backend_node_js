window.addEventListener('DOMContentLoaded', () => {
  renderTable();
});

async function renderTable() {
  const res = await apiFetch('/users');
  if (!res) return;

  const json = await res.json();
  const users = json?.data || [];
  const tableBody = document.getElementById('users-container');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  users.forEach((user) => {
    const row = document.createElement('tr');
    row.className = 'info-container';
    row.dataset.id = user.id;
    row.innerHTML = `
      <td>${user.username || ''}</td>
      <td>${formatRole(user.role)}</td>
      <td class="circles-btns">
        <div class="circle-btn editing"><i class="bi bi-pencil"></i></div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function formatRole(role) {
  const roles = {
    admin: 'Адміністратор',
  };
  return roles[role] ?? 'Користувач';
}

document.getElementById('users-container')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.circle-btn');
  if (!btn) return;

  const userId = btn.closest('.info-container')?.dataset.id;
  if (!userId) return;

  if (btn.classList.contains('editing')) editUserInfo(userId);
});

async function editUserInfo(id) {
  const res = await apiFetch(`/user/${id}`);
  if (!res) return;

  const user = await res.json();

  document.getElementById('editUsername').value = user.username ?? '';
  document.getElementById('editPassword').value = '';
  document.getElementById('editRole').value = user.role ?? '';

  const modalEl = document.getElementById('editUserModal');
  const editModal = new bootstrap.Modal(modalEl);
  editModal.show();

  const btn = document.getElementById('editUserBtn');
  const newBtn = btn.cloneNode(true);
  btn.replaceWith(newBtn);

  newBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const username = document.getElementById('editUsername').value.trim();
    const role = document.getElementById('editRole').value;
    const password = document.getElementById('editPassword').value;

    const body = { username, role };
    if (password) body.password = password;

    const res = await apiFetch(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    if (res?.ok) {
      editModal.hide();
      renderTable();
    }
  });
}

document.getElementById('addUserTrigger')?.addEventListener('click', () => {
  new bootstrap.Modal(document.getElementById('createUserModal')).show();
});

document.getElementById('createUserBtn')?.addEventListener('click', async () => {
  const username = document.getElementById('createUsername').value.trim();
  const password = document.getElementById('createPassword').value;
  const role = document.getElementById('createRole').value;

  if (!username || !password) return;

  const res = await apiFetch('/user', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  });

  if (res?.ok) {
    document.getElementById('createUsername').value = '';
    document.getElementById('createPassword').value = '';
    document.getElementById('createRole').value = '';

    bootstrap.Modal.getInstance(document.getElementById('createUserModal'))?.hide();
    renderTable();
  }
});