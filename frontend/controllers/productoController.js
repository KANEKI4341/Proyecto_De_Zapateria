// CONTROLADOR: conecta lo que hace el usuario con el modelo y las vistas

const ProductoController = {

    // ==================== LISTADO (index.html) ====================
    iniciarListado() {
        const POR_PAGINA = 6;
        let pagina = 1;
        let refParaEliminar = null;

        // Vuelve a calcular y dibujar todo el listado
        function actualizar() {
            const lista = Producto.filtrar(ListadoView.leerFiltros());
            const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));

            if (pagina > totalPaginas) {
                pagina = totalPaginas;
            }

            const inicio = (pagina - 1) * POR_PAGINA;
            const visibles = lista.slice(inicio, inicio + POR_PAGINA);

            ListadoView.mostrarResumen(Producto.resumen());
            ListadoView.mostrarListado(visibles, lista.length, inicio, pagina, totalPaginas);
        }

        function cerrarModal() {
            ListadoView.cerrarModal();
            refParaEliminar = null;
        }

        function eliminar() {
            Producto.eliminar(refParaEliminar);
            cerrarModal();
            actualizar();
        }

        // Botón Eliminar de cada tarjeta
        el("listado").addEventListener("click", function (e) {
            const boton = e.target.closest("[data-eliminar]");
            if (boton) {
                const producto = Producto.buscarPorRef(boton.dataset.eliminar);
                if (producto) {
                    refParaEliminar = producto.ref;
                    ListadoView.abrirModal(producto);
                }
            }
        });

        // Búsqueda y filtros
        ["buscar", "f-categoria", "f-marca", "f-existencias"].forEach(function (id) {
            el(id).addEventListener("input", function () {
                pagina = 1;
                actualizar();
            });
        });

        // Paginación
        el("btn_anterior").addEventListener("click", function () {
            pagina--;
            actualizar();
        });

        el("btn_siguiente").addEventListener("click", function () {
            pagina++;
            actualizar();
        });

        // Ventana de confirmación
        el("modal_cancelar").addEventListener("click", cerrarModal);
        el("modal_eliminar").addEventListener("click", eliminar);

        el("modal").addEventListener("click", function (e) {
            if (e.target === el("modal")) {
                cerrarModal();
            }
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !el("modal").hidden) {
                cerrarModal();
            }
        });

        actualizar();
    },

    // ==================== FORMULARIO (crear.html y editar.html) ====================
    // Si la dirección trae ?ref=PAS-001 es edición, si no es creación
    iniciarFormulario() {
        const refEditar = new URLSearchParams(window.location.search).get("ref");
        const esEdicion = refEditar !== null;

        const RUTA_IMAGENES = "assets/img/";
        const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
        const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

        const campos = ["ref", "nombre", "descripcion", "categoria", "marca", "talla", "color", "cantidad", "compra", "venta"];

        const nombresCampos = {
            ref: "referencia",
            nombre: "nombre",
            descripcion: "descripción",
            categoria: "categoría",
            marca: "marca",
            talla: "talla",
            color: "color",
            cantidad: "cantidad",
            compra: "precio de compra",
            venta: "precio de venta"
        };

        let fotoActual = ""; // solo la ruta, por ejemplo "assets/img/tenis.jpg"

        // ---------- Validaciones ----------
        // Devuelve el mensaje de error de un campo ("" si está bien)
        function obtenerError(campo) {
            const valor = FormularioView.leerCampo(campo);

            if (campo === "ref") {
                if (valor === "") {
                    return "La referencia es obligatoria.";
                }
                const existente = Producto.buscarPorRef(valor);
                const repetida = existente && existente.ref !== refEditar;
                return repetida ? "Esta referencia ya existe." : "";
            }

            if (campo === "nombre") {
                return valor === "" ? "El nombre es obligatorio." : "";
            }

            if (campo === "descripcion") {
                return valor === "" ? "La descripción es obligatoria." : "";
            }

            if (campo === "categoria") {
                return valor === "" ? "Selecciona una categoría." : "";
            }

            if (campo === "marca") {
                return valor === "" ? "Selecciona una marca." : "";
            }

            if (campo === "talla") {
                if (valor === "") {
                    return "La talla es obligatoria.";
                }
                const talla = Number(valor);
                return talla < 35 || talla > 45 ? "La talla debe estar entre 35 y 45." : "";
            }

            if (campo === "color") {
                return valor === "" ? "El color es obligatorio." : "";
            }

            if (campo === "cantidad") {
                if (valor === "") {
                    return "La cantidad es obligatoria.";
                }
                const cantidad = Number(valor);
                return !Number.isInteger(cantidad) || cantidad < 0 ? "Debe ser 0 o mayor." : "";
            }

            if (campo === "compra" || campo === "venta") {
                const precio = leerPrecio(valor);
                if (isNaN(precio)) {
                    return "El precio es obligatorio.";
                }
                return precio <= 0 ? "Debe ser mayor que $ 0 COP." : "";
            }

            return "";
        }

        // Muestra u oculta el error de un campo. Devuelve true si está bien.
        function revisarCampo(campo) {
            const mensaje = obtenerError(campo);
            FormularioView.mostrarError(campo, mensaje);
            return mensaje === "";
        }

        // Revisa todos los campos y devuelve los nombres de los que fallan
        function revisarTodos() {
            return campos.filter(function (campo) {
                return !revisarCampo(campo);
            });
        }

        // ---------- Fotografía (solo se guarda la ruta) ----------
        function elegirArchivo(archivo) {
            FormularioView.ocultarMensajesFoto();

            if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
                FormularioView.mostrarErrorFoto("Error: solo se permiten imágenes JPG, PNG o WEBP.");
                return;
            }

            if (archivo.size > MAX_BYTES) {
                FormularioView.mostrarErrorFoto("Error: la imagen supera los 5 MB.");
                return;
            }

            const mb = (archivo.size / 1048576).toFixed(1).replace(".", ",") + " MB";

            fotoActual = RUTA_IMAGENES + archivo.name;
            FormularioView.mostrarFoto(URL.createObjectURL(archivo), archivo.name + " · " + mb, "✓ Vista previa · seleccionada");
            FormularioView.mostrarFotoOk("Copia la imagen a la carpeta assets/img/ con el nombre " + archivo.name + " para que se vea en el listado.");
        }

        // ---------- Eventos de los campos ----------
        campos.forEach(function (campo) {
            const input = el("p_" + campo);

            // Los precios se muestran con formato al salir del campo
            if (campo === "compra" || campo === "venta") {
                input.addEventListener("blur", function () {
                    const precio = leerPrecio(input.value);
                    if (!isNaN(precio)) {
                        input.value = formatoPrecio(precio);
                    }
                });
            }

            input.addEventListener("blur", function () {
                revisarCampo(campo);
            });

            input.addEventListener("change", function () {
                revisarCampo(campo);
            });

            // Si ya tenía error, se quita apenas el usuario lo corrige
            input.addEventListener("input", function () {
                if (el("err_" + campo).textContent !== "") {
                    revisarCampo(campo);
                }
            });
        });

        // ---------- Eventos de la fotografía ----------
        el("foto").addEventListener("change", function () {
            if (el("foto").files[0]) {
                elegirArchivo(el("foto").files[0]);
            }
        });

        el("btn_cambiar").addEventListener("click", function () {
            el("foto").click();
        });

        el("btn_quitar").addEventListener("click", function () {
            fotoActual = "";
            FormularioView.quitarFoto();
        });

        // Arrastrar y soltar
        el("dropzone").addEventListener("dragover", function (e) {
            e.preventDefault();
            el("dropzone").classList.add("is-drag");
        });

        el("dropzone").addEventListener("dragleave", function () {
            el("dropzone").classList.remove("is-drag");
        });

        el("dropzone").addEventListener("drop", function (e) {
            e.preventDefault();
            el("dropzone").classList.remove("is-drag");
            if (e.dataTransfer.files[0]) {
                elegirArchivo(e.dataTransfer.files[0]);
            }
        });

        // ---------- Cargar los datos si es edición ----------
        if (esEdicion) {
            const producto = Producto.buscarPorRef(refEditar);

            if (!producto) {
                window.location.href = "index.html";
                return;
            }

            campos.forEach(function (campo) {
                FormularioView.escribirCampo(campo, producto[campo]);
            });

            FormularioView.escribirCampo("compra", formatoPrecio(producto.compra));
            FormularioView.escribirCampo("venta", formatoPrecio(producto.venta));

            // Si no se elige otra imagen, se conserva la ruta actual
            if (producto.foto) {
                fotoActual = producto.foto;
                FormularioView.mostrarFoto(producto.foto, producto.foto.split("/").pop(), "✓ Fotografía actual");
            }
        }

        // ---------- Guardar ----------
        el("form_producto").addEventListener("submit", function (e) {
            e.preventDefault();

            const fallan = revisarTodos();

            if (fallan.length > 0) {
                const nombres = fallan.map(function (campo) {
                    return nombresCampos[campo];
                });
                FormularioView.mostrarEstado(
                    "No se pudo guardar. Corrige " + fallan.length + (fallan.length === 1 ? " campo: " : " campos: ") + nombres.join(", ") + ".",
                    "is-error"
                );
                FormularioView.enfocarCampo(fallan[0]);
                return;
            }

            const producto = {
                ref: FormularioView.leerCampo("ref"),
                nombre: FormularioView.leerCampo("nombre"),
                descripcion: FormularioView.leerCampo("descripcion"),
                categoria: FormularioView.leerCampo("categoria"),
                marca: FormularioView.leerCampo("marca"),
                talla: Number(FormularioView.leerCampo("talla")),
                color: FormularioView.leerCampo("color"),
                cantidad: Number(FormularioView.leerCampo("cantidad")),
                compra: leerPrecio(FormularioView.leerCampo("compra")),
                venta: leerPrecio(FormularioView.leerCampo("venta")),
                foto: fotoActual
            };

            const guardado = esEdicion ? Producto.editar(refEditar, producto) : Producto.crear(producto);

            if (!guardado) {
                FormularioView.mostrarEstado("No se pudo guardar el producto en el navegador.", "is-error");
                return;
            }

            FormularioView.mostrarEstado(esEdicion ? "Cambios guardados." : "Producto creado.", "is-ok");

            setTimeout(function () {
                window.location.href = "index.html";
            }, 800);
        });
    }
};