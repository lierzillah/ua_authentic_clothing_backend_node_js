const menuContainer = document.getElementById('menuContainer');
const menuToggle = document.getElementById('menuToggle');

menuToggle?.addEventListener('click', () => {
  menuContainer.classList.toggle('open');
});

const currentPath = window.location.pathname;

if (currentPath.includes('/admin/users')) {
  document.getElementById('menuUsers')?.classList.add('active');
} else if (currentPath.includes('/admin/exhibits')) {
  document.getElementById('menuExhibits')?.classList.add('active');
}
