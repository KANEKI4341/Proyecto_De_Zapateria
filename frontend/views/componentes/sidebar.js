// Menú lateral que se usa en index.html, crear.html y editar.html

function renderSidebar() {
    el("sidebar").innerHTML = `
        <div class="sidebar_top">
            <a href="index.html" class="marca">
                <span class="nombre_marca">paso.</span>
                <br>
                <span class="tag_marca">Zapatería</span>
            </a>
        </div>

        <p class="sidebar_label">Mi negocio</p>

        <nav>
            <ul class="nav">
                <li><a class="nav_link is-active" href="index.html">Productos</a></li>
            </ul>
        </nav>

        <div class="tip">
            <p class="tip_titulo">Cada paso, en orden.</p>
            <p class="tip_texto">Mantén tus productos al día y tu negocio en movimiento.</p>
        </div>

        <div class="sidebar_bottom">
            <a href="#" class="help_link">Centro de ayuda</a>
            <p class="sidebar_foot">Paso · Tu negocio, un paso adelante.</p>
        </div>
    `;
}