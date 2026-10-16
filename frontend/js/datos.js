// Datos y funciones compartidas por todas las páginas

const CLAVE = "paso_productos";
const STOCK_BAJO = 5; // 5 pares o menos = stock bajo

const productosIniciales = [
    {
        ref: "PAS-001",
        nombre: "Tenis Urban Blanco",
        descripcion: "Tenis cómodo de uso diario.",
        categoria: "Tenis",
        marca: "Paso",
        talla: 38,
        color: "Blanco / verde",
        cantidad: 24,
        compra: 109900,
        venta: 189900,
        foto: "assets/img/tenis-urban-blanco.jpg"
    },
    {
        ref: "PAS-002",
        nombre: "Mocasín Clásico Cuero",
        descripcion: "Mocasín en cuero con forro suave.",
        categoria: "Mocasines",
        marca: "Andina",
        talla: 40,
        color: "Café",
        cantidad: 8,
        compra: 139900,
        venta: 229900,
        foto: "assets/img/mocasin-clasico-cuero.jpg"
    },
    {
        ref: "PAS-003",
        nombre: "Sandalia Arena",
        descripcion: "Sandalia ligera para el verano.",
        categoria: "Sandalias",
        marca: "Solé",
        talla: 37,
        color: "Beige",
        cantidad: 3,
        compra: 69900,
        venta: 119900,
        foto: "assets/img/sandalia-arena.jpg"
    }
];

// Lee los productos guardados en el navegador
function obtenerProductos() {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) {
        return JSON.parse(guardado);
    }
    guardarProductos(productosIniciales);
    return productosIniciales;
}

// Guarda los productos. Devuelve false si no hay espacio.
function guardarProductos(lista) {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(lista));
        return true;
    } catch (error) {
        return false;
    }
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