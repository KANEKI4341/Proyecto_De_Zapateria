// Barra superior que se usa en index.html, crear.html y editar.html
// paginaActual es el texto que aparece al final de la ruta: "Productos", "Crear producto"...

function renderTopbar(paginaActual) {
    el("topbar").innerHTML = `
        <nav class="breadcrumb">
            <a href="index.html">Mi negocio</a>
            <span>/</span>
            <span aria-current="page">${limpiar(paginaActual)}</span>
        </nav>

        <div class="topbar_right">
            <div class="user">
                <div class="user_info">
                    <strong>María Torres</strong>
                    <span>Administradora · Bogotá</span>
                </div>
                <span class="avatar">MT</span>
            </div>
        </div>
    `;
}