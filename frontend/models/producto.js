// MODELO: todo lo que tiene que ver con los datos de los productos

const CLAVE = "producto";
const CLAVE_ANTIGUA = "paso_productos";
const STOCK_BAJO = 5; // 5 pares o menos = stock bajo

const Producto = {

    datosIniciales: [
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
    ],

    // Pasa los productos de la clave antigua ("paso_productos") a la nueva ("producto")
    migrar() {
        const antiguo = localStorage.getItem(CLAVE_ANTIGUA);

        if (antiguo === null || localStorage.getItem(CLAVE) !== null) {
            return;
        }

        const lista = JSON.parse(antiguo).map(function (p) {
            // las imágenes en Base64 ya no se guardan
            if (p.foto && p.foto.startsWith("data:")) {
                p.foto = "";
            }
            return p;
        });

        if (this.guardar(lista)) {
            localStorage.removeItem(CLAVE_ANTIGUA);
        }
    },

    // Guarda la lista completa. Devuelve false si no se pudo.
    guardar(lista) {
        try {
            localStorage.setItem(CLAVE, JSON.stringify(lista));
            return true;
        } catch (error) {
            return false;
        }
    },

    obtenerTodos() {
        this.migrar();

        const guardado = localStorage.getItem(CLAVE);
        if (guardado !== null) {
            return JSON.parse(guardado);
        }

        this.guardar(this.datosIniciales);
        return this.datosIniciales;
    },

    buscarPorRef(ref) {
        return this.obtenerTodos().find(function (p) {
            return p.ref.toLowerCase() === ref.toLowerCase();
        });
    },

    crear(producto) {
        const lista = this.obtenerTodos();
        lista.unshift(producto); // el nuevo queda de primero
        return this.guardar(lista);
    },

    editar(refOriginal, producto) {
        const lista = this.obtenerTodos();
        const posicion = lista.findIndex(function (p) {
            return p.ref === refOriginal;
        });

        if (posicion === -1) {
            return false;
        }

        lista[posicion] = producto;
        return this.guardar(lista);
    },

    eliminar(ref) {
        const restantes = this.obtenerTodos().filter(function (p) {
            return p.ref !== ref;
        });
        return this.guardar(restantes);
    },

    esStockBajo(producto) {
        return producto.cantidad <= STOCK_BAJO;
    },

    // Productos que coinciden con la búsqueda y los filtros
    filtrar(filtros) {
        const texto = filtros.texto.toLowerCase();
        const modelo = this;

        return this.obtenerTodos().filter(function (p) {
            const coincideTexto =
                p.nombre.toLowerCase().includes(texto) ||
                p.ref.toLowerCase().includes(texto) ||
                p.marca.toLowerCase().includes(texto);

            const coincideCategoria = filtros.categoria === "" || p.categoria === filtros.categoria;
            const coincideMarca = filtros.marca === "" || p.marca === filtros.marca;

            let coincideExistencias = true;
            if (filtros.existencias === "bajo") {
                coincideExistencias = modelo.esStockBajo(p);
            } else if (filtros.existencias === "disponible") {
                coincideExistencias = !modelo.esStockBajo(p);
            }

            return coincideTexto && coincideCategoria && coincideMarca && coincideExistencias;
        });
    },

    // Números del resumen de arriba
    resumen() {
        const lista = this.obtenerTodos();
        let pares = 0;
        let bajos = 0;

        lista.forEach(function (p) {
            pares += p.cantidad;
            if (p.cantidad <= STOCK_BAJO) {
                bajos++;
            }
        });

        return { productos: lista.length, pares: pares, bajos: bajos };
    }
};