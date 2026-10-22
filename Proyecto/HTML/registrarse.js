const formularioRegistro = document.getElementById('registro-form');

formularioRegistro.addEventListener('submit', (evento) => {
  evento.preventDefault();
  alert('Su cuenta ha sido creada. Por favor, inicie sesión.');
  window.location.href = 'iniciarClases.html';
});