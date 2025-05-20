document.addEventListener('DOMContentLoaded', () => {
    // Productos de ejemplo
    const productos = [
        {id:1, nombre:"Arroz Diana 500g", precio:2500},
        {id:2, nombre:"Aceite Premier 1L", precio:7000},
        {id:3, nombre:"Azúcar Incauca 1kg", precio:4200},
        {id:4, nombre:"Sal Refisal 500g", precio:1000},
        {id:5, nombre:"Frijol Rojo 500g", precio:3800},
        {id:6, nombre:"Lenteja 500g", precio:3500},
        {id:7, nombre:"Pasta Doria 250g", precio:2000},
        {id:8, nombre:"Café Sello Rojo 250g", precio:6500}
    ];
    let carrito = [];

    // Guardar la imagen de cada producto al añadirlo al carrito
    function getImagenProducto(id) {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (!card) return '';
        const img = card.querySelector('img');
        return img ? img.getAttribute('src') : '';
    }

    function actualizarCarrito() {
        const cartCount = document.getElementById('cartCount');
        const cartCountMobile = document.getElementById('cartCountMobile');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const totalCantidad = carrito.reduce((a, p) => a + p.cantidad, 0);
        if(cartCount) cartCount.textContent = totalCantidad;
        if(cartCountMobile) cartCountMobile.textContent = totalCantidad;
        cartItems.innerHTML = '';
        let total = 0;
        carrito.forEach(item => {
            total += item.precio * item.cantidad;
            // Mostrar imagen junto al nombre
            cartItems.innerHTML += `
                <li class="flex justify-between items-center mb-2">
                    <span class="flex items-center gap-2">
                        <img src="${item.imagen || getImagenProducto(item.id)}" alt="${item.nombre}" class="w-8 h-8 rounded object-cover border" />
                        ${item.nombre} x${item.cantidad}
                    </span>
                    <span>
                        $${item.precio * item.cantidad}
                        <button class="ml-2 text-red-500 font-bold remove-item" data-id="${item.id}">&times;</button>
                    </span>
                </li>
            `;
        });
        cartTotal.textContent = `$${total}`;
        if(carrito.length === 0) {
            cartItems.innerHTML = '<li class="text-gray-400 text-center">El carrito está vacío</li>';
        }

        // Botones eliminar producto
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.onclick = function() {
                const id = Number(this.getAttribute('data-id'));
                carrito = carrito.filter(p => p.id !== id);
                actualizarCarrito();
            };
        });
    }

    // Modal de cantidad mejorado
    let modalCantidad = document.createElement('div');
    modalCantidad.innerHTML = `
        <div id="cantidadModalBg" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden transition-opacity duration-200">
            <div class="bg-white rounded-2xl shadow-2xl w-80 p-7 relative flex flex-col items-center animate-scaleIn">
                <button id="cantidadCerrar" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
                <h3 class="text-xl font-bold mb-4 text-blue-700" id="cantidadModalTitle">¿Cuántos desea añadir?</h3>
                <input id="cantidadInput" type="number" min="1" value="1" class="border-2 border-blue-200 rounded-lg w-24 text-center mb-4 py-1 text-lg focus:outline-none focus:border-blue-500 transition" />
                <div class="flex gap-4 mb-2 w-full justify-center">
                    <button id="cantidadAgregar" class="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">Agregar</button>
                    <button id="cantidadCancelar" class="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-bold hover:bg-gray-300 transition">Cancelar</button>
                </div>
                <div id="cantidadMensaje" class="text-green-600 font-semibold text-center mt-2 opacity-0 transition-opacity duration-300"></div>
            </div>
        </div>
        <style>
            @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .animate-scaleIn { animation: scaleIn 0.2s; }
        </style>
    `;
    document.body.appendChild(modalCantidad);

    let productoSeleccionado = null;

    // Mostrar modal al dar click en "Añadir al carrito"
    document.querySelectorAll('.addCart').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const card = e.target.closest('[data-id]');
            const id = Number(card.getAttribute('data-id'));
            productoSeleccionado = id;
            document.getElementById('cantidadInput').value = 1;
            document.getElementById('cantidadAgregar').disabled = false;
            document.getElementById('cantidadMensaje').textContent = '';
            document.getElementById('cantidadMensaje').classList.remove('opacity-100');
            document.getElementById('cantidadMensaje').classList.add('opacity-0');
            // Mostrar cuántos hay en el carrito de este producto
            const existe = carrito.find(p => p.id === id);
            const cantidadEnCarrito = existe ? existe.cantidad : 0;
            document.getElementById('cantidadEnCarrito') &&
                (document.getElementById('cantidadEnCarrito').textContent =
                    cantidadEnCarrito > 0
                        ? `Actualmente tienes ${cantidadEnCarrito} en el carrito.`
                        : 'No tienes este producto en el carrito.');
            document.getElementById('cantidadModalBg').classList.remove('hidden');
            document.getElementById('cantidadInput').focus();
        });
    });

    // Validar input y desactivar botón si es inválido
    document.getElementById('cantidadInput').addEventListener('input', function() {
        const cantidad = parseInt(this.value, 10);
        document.getElementById('cantidadAgregar').disabled = isNaN(cantidad) || cantidad < 1;
    });

    // Botón agregar
    document.getElementById('cantidadAgregar').onclick = () => {
        const cantidad = parseInt(document.getElementById('cantidadInput').value, 10);
        if (isNaN(cantidad) || cantidad < 1) return;
        const prod = productos.find(p => p.id === productoSeleccionado);
        const existe = carrito.find(p => p.id === productoSeleccionado);
        const imagen = getImagenProducto(productoSeleccionado);
        if(existe) existe.cantidad += cantidad;
        else carrito.push({...prod, cantidad, imagen});
        actualizarCarrito();
        // Mensaje de confirmación visual
        const mensaje = document.getElementById('cantidadMensaje');
        mensaje.textContent = `Agregaste ${cantidad} unidad${cantidad > 1 ? 'es' : ''} de "${prod.nombre}"`;
        mensaje.classList.remove('opacity-0');
        mensaje.classList.add('opacity-100');
        // Ocultar modal después de 1.2 segundos
        setTimeout(() => {
            document.getElementById('cantidadModalBg').classList.add('hidden');
            mensaje.classList.remove('opacity-100');
            mensaje.classList.add('opacity-0');
        }, 1200);
    };

    // Botón cancelar y cerrar
    document.getElementById('cantidadCancelar').onclick = cerrarModalCantidad;
    document.getElementById('cantidadCerrar').onclick = cerrarModalCantidad;
    function cerrarModalCantidad() {
        document.getElementById('cantidadModalBg').classList.add('hidden');
        document.getElementById('cantidadMensaje').classList.remove('opacity-100');
        document.getElementById('cantidadMensaje').classList.add('opacity-0');
    }

    // Abrir carrito desde ambos botones
    const cartBtn = document.getElementById('cartBtn');
    const cartBtnMobile = document.getElementById('cartBtnMobile');
    if (cartBtn) {
        cartBtn.onclick = () => {
            document.getElementById('cartModal').classList.remove('hidden');
            actualizarCarrito();
        };
    }
    if (cartBtnMobile) {
        cartBtnMobile.onclick = () => {
            document.getElementById('cartModal').classList.remove('hidden');
            actualizarCarrito();
        };
    }
    document.getElementById('closeCart').onclick = () => {
        document.getElementById('cartModal').classList.add('hidden');
    };
});
