// Funciones pequeñas que usan todas las páginas

// Atajo para buscar un elemento por su id
function el(id) {
    return document.getElementById(id);
}

// 109900 -> "$ 109.900 COP"
function formatoPrecio(numero) {
    const signo = numero < 0 ? "−" : "";
    const texto = String(Math.abs(numero)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return signo + "$ " + texto + " COP";
}

// "$ 109.900 COP" -> 109900 (si está vacío devuelve NaN)
function leerPrecio(texto) {
    const negativo = texto.includes("-") || texto.includes("−");
    const digitos = texto.replace(/\D/g, "");
    if (digitos === "") {
        return NaN;
    }
    return negativo ? -Number(digitos) : Number(digitos);
}

// Evita que el texto escrito por el usuario rompa el HTML
function limpiar(texto) {
    const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(texto).replace(/[&<>"']/g, function (c) {
        return reemplazos[c];
    });
}