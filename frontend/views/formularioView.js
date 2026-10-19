// VISTA del formulario (crear y editar): solo lee y dibuja, no valida ni guarda

const FormularioView = {

    leerCampo(campo) {
        return el("p_" + campo).value.trim();
    },

    escribirCampo(campo, valor) {
        el("p_" + campo).value = valor;
    },

    enfocarCampo(campo) {
        el("p_" + campo).focus();
    },

    // mensaje vacío = quita el error
    mostrarError(campo, mensaje) {
        el("err_" + campo).textContent = mensaje;
        el("p_" + campo).closest(".campo").classList.toggle("tiene_error", mensaje !== "");
    },

    // tipo puede ser "is-ok", "is-error" o ""
    mostrarEstado(texto, tipo) {
        el("estado").textContent = texto;
        el("estado").className = tipo;
    },

    // ---------- Fotografía ----------
    mostrarFoto(src, nombre, textoBadge) {
        el("preview_img").src = src;
        el("badge").textContent = textoBadge;
        el("file_name").textContent = nombre;
        el("preview").hidden = false;
        el("file_row").hidden = false;
        el("dropzone").hidden = true;
    },

    quitarFoto() {
        el("foto").value = "";
        el("preview_img").removeAttribute("src");
        el("preview").hidden = true;
        el("file_row").hidden = true;
        el("dropzone").hidden = false;
        this.ocultarMensajesFoto();
    },

    mostrarErrorFoto(mensaje) {
        el("foto_error_texto").textContent = mensaje;
        el("foto_error").hidden = false;
        el("foto_ok").hidden = true;
    },

    mostrarFotoOk(mensaje) {
        el("foto_ok_texto").textContent = mensaje;
        el("foto_ok").hidden = false;
        el("foto_error").hidden = true;
    },

    ocultarMensajesFoto() {
        el("foto_error").hidden = true;
        el("foto_ok").hidden = true;
    }
};