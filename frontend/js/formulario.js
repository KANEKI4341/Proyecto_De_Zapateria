// Sirve para crear.html y editar.html
// Si la dirección trae ?ref=PAS-001 es edición, si no es creación

const parametros = new URLSearchParams(window.location.search);
const refEditar = parametros.get("ref");
const esEdicion = refEditar !== null;

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

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const form = document.getElementById("form_producto");
const estado = document.getElementById("estado");

const fotoInput = document.getElementById("foto");
const dropzone = document.getElementById("dropzone");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("preview_img");
const badge = document.getElementById("badge");
const filaArchivo = document.getElementById("file_row");
const nombreArchivo = document.getElementById("file_name");
const progreso = document.getElementById("progress");
const barra = document.getElementById("progress_bar");
const fotoError = document.getElementById("foto_error");
const fotoErrorTexto = document.getElementById("foto_error_texto");
const fotoOk = document.getElementById("foto_ok");

let fotoActual = ""; // ruta o imagen en base64 del producto

function el(id) {
    return document.getElementById(id);
}

// ---------- Validaciones ----------
// Devuelve el mensaje de error de un campo ("" si está bien)
function obtenerError(campo) {
    const valor = el("p_" + campo).value.trim();

    if (campo === "ref") {
        if (valor === "") {
            return "La referencia es obligatoria.";
        }
        const repetida = obtenerProductos().some(function (p) {
            return p.ref.toLowerCase() === valor.toLowerCase() && p.ref !== refEditar;
        });
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

// Muestra u oculta el error de un campo
function revisarCampo(campo) {
    const mensaje = obtenerError(campo);
    el("err_" + campo).textContent = mensaje;
    el("p_" + campo).closest(".campo").classList.toggle("tiene_error", mensaje !== "");
    return mensaje === "";
}

// Revisa todos los campos y devuelve los nombres de los que fallan
function revisarTodos() {
    const fallan = [];
    campos.forEach(function (campo) {
        if (!revisarCampo(campo)) {
            fallan.push(campo);
        }
    });
    return fallan;
}

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

// ---------- Fotografía ----------
function tamano(bytes) {
    return (bytes / 1048576).toFixed(1).replace(".", ",") + " MB";
}

function mostrarFoto(src, nombre, textoBadge) {
    previewImg.src = src;
    badge.textContent = textoBadge;
    nombreArchivo.textContent = nombre;
    preview.hidden = false;
    filaArchivo.hidden = false;
    dropzone.hidden = true;
}

function quitarFoto() {
    fotoActual = "";
    fotoInput.value = "";
    previewImg.removeAttribute("src");
    preview.hidden = true;
    filaArchivo.hidden = true;
    progreso.hidden = true;
    fotoOk.hidden = true;
    fotoError.hidden = true;
    dropzone.hidden = false;
}

function mostrarErrorFoto(mensaje) {
    fotoErrorTexto.textContent = mensaje;
    fotoError.hidden = false;
    fotoOk.hidden = true;
}

function procesarArchivo(archivo) {
    fotoError.hidden = true;
    fotoOk.hidden = true;

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
        mostrarErrorFoto("Error: solo se permiten imágenes JPG, PNG o WEBP.");
        return;
    }

    if (archivo.size > MAX_BYTES) {
        mostrarErrorFoto("Error: la imagen supera los 5 MB.");
        return;
    }

    const lector = new FileReader();

    barra.style.width = "0";
    progreso.hidden = false;
    preview.hidden = false;
    badge.textContent = "Cargando · 0 %";

    lector.onprogress = function (e) {
        if (e.lengthComputable) {
            const porcentaje = Math.round((e.loaded / e.total) * 100);
            barra.style.width = porcentaje + "%";
            badge.textContent = "Cargando · " + porcentaje + " %";
        }
    };

    lector.onload = function () {
        fotoActual = lector.result;
        mostrarFoto(fotoActual, archivo.name + " · " + tamano(archivo.size), "✓ Vista previa · seleccionada");
        progreso.hidden = true;
        fotoOk.hidden = false;
    };

    lector.onerror = function () {
        progreso.hidden = true;
        mostrarErrorFoto("Error: no se pudo leer la imagen.");
    };

    lector.readAsDataURL(archivo);
}

fotoInput.addEventListener("change", function () {
    if (fotoInput.files[0]) {
        procesarArchivo(fotoInput.files[0]);
    }
});

document.getElementById("btn_cambiar").addEventListener("click", function () {
    fotoInput.click();
});

document.getElementById("btn_quitar").addEventListener("click", quitarFoto);

// Arrastrar y soltar
dropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropzone.classList.add("is-drag");
});

dropzone.addEventListener("dragleave", function () {
    dropzone.classList.remove("is-drag");
});

dropzone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropzone.classList.remove("is-drag");
    if (e.dataTransfer.files[0]) {
        procesarArchivo(e.dataTransfer.files[0]);
    }
});

// ---------- Cargar datos si es edición ----------
if (esEdicion) {
    const producto = obtenerProductos().find(function (p) {
        return p.ref === refEditar;
    });

    if (!producto) {
        window.location.href = "index.html";
    } else {
        campos.forEach(function (campo) {
            el("p_" + campo).value = producto[campo];
        });

        el("p_compra").value = formatoPrecio(producto.compra);
        el("p_venta").value = formatoPrecio(producto.venta);

        if (producto.foto) {
            fotoActual = producto.foto;
            const nombre = producto.foto.startsWith("data:") ? "Fotografía actual" : producto.foto.split("/").pop();
            mostrarFoto(producto.foto, nombre, "✓ Fotografía actual");
        }
    }
}

// ---------- Guardar ----------
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const fallan = revisarTodos();

    if (fallan.length > 0) {
        const nombres = fallan.map(function (campo) {
            return nombresCampos[campo];
        });
        estado.textContent =
            "No se pudo guardar. Corrige " + fallan.length + (fallan.length === 1 ? " campo: " : " campos: ") + nombres.join(", ") + ".";
        estado.className = "is-error";
        el("p_" + fallan[0]).focus();
        return;
    }

    const producto = {
        ref: el("p_ref").value.trim(),
        nombre: el("p_nombre").value.trim(),
        descripcion: el("p_descripcion").value.trim(),
        categoria: el("p_categoria").value,
        marca: el("p_marca").value,
        talla: Number(el("p_talla").value),
        color: el("p_color").value.trim(),
        cantidad: Number(el("p_cantidad").value),
        compra: leerPrecio(el("p_compra").value),
        venta: leerPrecio(el("p_venta").value),
        foto: fotoActual
    };

    const lista = obtenerProductos();

    if (esEdicion) {
        const posicion = lista.findIndex(function (p) {
            return p.ref === refEditar;
        });
        lista[posicion] = producto;
    } else {
        lista.unshift(producto); // el nuevo queda de primero
    }

    if (!guardarProductos(lista)) {
        estado.textContent = "No se pudo guardar: la fotografía es muy pesada para el navegador. Prueba con una más liviana.";
        estado.className = "is-error";
        return;
    }

    estado.textContent = esEdicion ? "Cambios guardados." : "Producto creado.";
    estado.className = "is-ok";

    setTimeout(function () {
        window.location.href = "index.html";
    }, 800);
});