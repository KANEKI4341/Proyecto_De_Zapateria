// VISTA del listado: solo dibuja en pantalla, no guarda ni calcula datos

const ListadoView = {

    // Lee lo que el usuario escribió o eligió en los filtros
    leerFiltros() {
        return {
            texto: el("buscar").value.trim(),
            categoria: el("f-categoria").value,
            marca: el("f-marca").value,
            existencias: el("f-existencias").value
        };
    },

    mostrarResumen(resumen) {
        el("stat_productos").textContent = resumen.productos;
        el("stat_pares").textContent = resumen.pares;
        el("stat_bajo").textContent = resumen.bajos + (resumen.bajos === 1 ? " producto" : " productos");
    },

    crearTarjeta(p) {
        const bajo = Producto.esStockBajo(p);
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
    },

    // visibles = productos de la página actual, total = cantidad con filtros aplicados
    mostrarListado(visibles, total, inicio, pagina, totalPaginas) {
        el("listado").innerHTML = visibles.map(this.crearTarjeta).join("");
        el("vacio").hidden = total > 0;

        el("contador").textContent = "Mostrando " + total + (total === 1 ? " producto" : " productos");

        if (total === 0) {
            el("paginacion").textContent = "0 productos";
        } else {
            el("paginacion").textContent =
                (inicio + 1) + "–" + (inicio + visibles.length) + " de " + total +
                " productos · Página " + pagina + " de " + totalPaginas;
        }

        el("btn_anterior").disabled = pagina === 1;
        el("btn_siguiente").disabled = pagina === totalPaginas;
    },

    abrirModal(producto) {
        el("modal_titulo").textContent = "¿Eliminar " + producto.nombre + "?";
        el("modal_texto").textContent =
            "Se eliminarán el producto, su fotografía, sus precios y sus " + producto.cantidad + " pares del catálogo.";
        el("modal").hidden = false;
        el("modal_cancelar").focus();
    },

    cerrarModal() {
        el("modal").hidden = true;
    }
};