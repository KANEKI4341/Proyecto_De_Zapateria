// Arranque de crear.html y editar.html

const esPaginaEditar = new URLSearchParams(window.location.search).has("ref");

renderSidebar();
renderTopbar(esPaginaEditar ? "Editar producto" : "Crear producto");
ProductoController.iniciarFormulario();