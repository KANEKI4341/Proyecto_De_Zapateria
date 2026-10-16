// Página de listado de productos

const POR_PAGINA = 6;
let pagina = 1;
let refParaEliminar = null;

const listado = document.getElementById("listado");
const vacio = document.getElementById("vacio");
const contador = document.getElementById("contador");
const paginacion = document.getElementById("paginacion");
const btnAnterior = document.getElementById("btn_anterior");
const btnSiguiente = document.getElementById("btn_siguiente");

const buscar = document.getElementById("buscar");
const filtroCategoria = document.getElementById("f-categoria");
const filtroMarca = document.getElementById("f-marca");
const filtroExistencias = document.getElementById("f-existencias");

const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modal_titulo");
const modalTexto = document.getElementById("modal_texto");
const modalCancelar = document.getElementById("modal_cancelar");
const modalEliminar = document.getElementById("modal_eliminar");

// ---------- Resumen de arriba ----------
function actualizarResumen(productos) {
    let pares = 0;
    let bajos = 0;

    productos.forEach(function (p) {
        pares += p.cantidad;
        if (p.cantidad <= STOCK_BAJO) {
            bajos++;
        }
    });

    document.getElementById("stat_productos").textContent = productos.length;
    document.getElementById("stat_pares").textContent = pares;
    document.getElementById("stat_bajo").textContent = bajos + (bajos === 1 ? " producto" : " productos");
}

// ---------- Filtros ----------
function filtrar(productos) {
    const texto = buscar.value.trim().toLowerCase();

    return productos.filter(function (p) {
        const coincideTexto =
            p.nombre.toLowerCase().includes(texto) ||
            p.ref.toLowerCase().includes(texto) ||
            p.marca.toLowerCase().includes(texto);

        const coincideCategoria = filtroCategoria.value === "" || p.categoria === filtroCategoria.value;
        const coincideMarca = filtroMarca.value === "" || p.marca === filtroMarca.value;

        let coincideExistencias = true;
        if (filtroExistencias.value === "bajo") {
            coincideExistencias = p.cantidad <= STOCK_BAJO;
        } else if (filtroExistencias.value === "disponible") {
            coincideExistencias = p.cantidad > STOCK_BAJO;
        }

        return coincideTexto && coincideCategoria && coincideMarca && coincideExistencias;
    });
}

// ---------- Tarjeta de producto ----------
function crearTarjeta(p) {
    const bajo = p.cantidad <= STOCK_BAJO;
    const pares = p.cantidad === 1 ? "1 par" : p.cantidad + " pares";
    const textoStock = bajo ? pares + " · Stock bajo" : pares;
    const imagen = p.foto
        ? '<img src="' + limpiar(p.foto) + '" alt="' + limpiar(p.nombre) + '" loading="lazy" onerror="this.style.display=\'none\'">'
        : "";

    return `
        <article class="tarjeta_producto">
            <div class="tarjeta_producto_imagen">
                <span class="tarjeta_producto_ref">${limpiar(p.ref)}</span>
                ${imagen}
            </div>

            <div class="tarjeta_producto_body">
                <h2 class="tarjeta_producto_titulo">${limpiar(p.nombre)}</h2>
                <p class="tarjeta_producto_desc">${limpiar(p.marca)} · Talla ${p.talla} · ${limpiar(p.color)}</p>

                <dl class="prices">
                    <div>
                        <dt>Compra</dt>
                        <dd class="price-buy">${formatoPrecio(p.compra)}</dd>
                    </div>
                    <div>
                        <dt>Venta</dt>
                        <dd class="price-sell">${formatoPrecio(p.venta)}</dd>
                    </div>
                </dl>

                <div class="stock">
                    <span>Existencias</span>
                    <strong class="stock_value ${bajo ? "is-bajo" : ""}">${textoStock}</strong>
                </div>

                <div class="card__actions">
                    <a class="btn btn_secundario" href="editar.html?ref=${encodeURIComponent(p.ref)}">Editar</a>
                    <button type="button" class="btn btn_peligro" data-eliminar="${limpiar(p.ref)}">Eliminar</button>
                </div>
            </div>
        </article>
    `;
}

// ---------- Mostrar todo en pantalla ----------
function mostrar() {
    const todos = obtenerProductos();
    actualizarResumen(todos);

    const lista = filtrar(todos);
    const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));

    if (pagina > totalPaginas) {
        pagina = totalPaginas;
    }

    const inicio = (pagina - 1) * POR_PAGINA;
    const visibles = lista.slice(inicio, inicio + POR_PAGINA);

    listado.innerHTML = visibles.map(crearTarjeta).join("");
    vacio.hidden = lista.length > 0;

    contador.textContent = "Mostrando " + lista.length + (lista.length === 1 ? " producto" : " productos");

    if (lista.length === 0) {
        paginacion.textContent = "0 productos";
    } else {
        paginacion.textContent =
            (inicio + 1) + "–" + (inicio + visibles.length) + " de " + lista.length +
            " productos · Página " + pagina + " de " + totalPaginas;
    }

    btnAnterior.disabled = pagina === 1;
    btnSiguiente.disabled = pagina === totalPaginas;
}

// ---------- Ventana de eliminar ----------
function abrirModal(ref) {
    const producto = obtenerProductos().find(function (p) {
        return p.ref === ref;
    });

    if (!producto) {
        return;
    }

    refParaEliminar = ref;
    modalTitulo.textContent = "¿Eliminar " + producto.nombre + "?";
    modalTexto.textContent =
        "Se eliminarán el producto, su fotografía, sus precios y sus " + producto.cantidad + " pares del catálogo.";
    modal.hidden = false;
    modalCancelar.focus();
}

function cerrarModal() {
    modal.hidden = true;
    refParaEliminar = null;
}

function eliminarProducto() {
    const restantes = obtenerProductos().filter(function (p) {
        return p.ref !== refParaEliminar;
    });
    guardarProductos(restantes);
    cerrarModal();
    mostrar();
}

// ---------- Eventos ----------
listado.addEventListener("click", function (e) {
    const boton = e.target.closest("[data-eliminar]");
    if (boton) {
        abrirModal(boton.dataset.eliminar);
    }
});

[buscar, filtroCategoria, filtroMarca, filtroExistencias].forEach(function (campo) {
    campo.addEventListener("input", function () {
        pagina = 1;
        mostrar();
    });
});

btnAnterior.addEventListener("click", function () {
    pagina--;
    mostrar();
});

btnSiguiente.addEventListener("click", function () {
    pagina++;
    mostrar();
});

modalCancelar.addEventListener("click", cerrarModal);
modalEliminar.addEventListener("click", eliminarProducto);

modal.addEventListener("click", function (e) {
    if (e.target === modal) {
        cerrarModal();
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) {
        cerrarModal();
    }
});

mostrar();