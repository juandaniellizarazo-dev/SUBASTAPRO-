/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
//          LOCAL STORAGE DATABASE
// ==========================================
function getLocalStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading key ${key}`, error);
    return defaultValue;
  }
}

function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing key ${key}`, error);
  }
}

function seedMockData() {
  const usersExisted = localStorage.getItem("usuarios");
  const productsExisted = localStorage.getItem("productos");
  const offersExisted = localStorage.getItem("ofertas");

  if (usersExisted && productsExisted && offersExisted) {
    return; // Already populated
  }

  const mockUsers = [
    { id: "usr_1", nombre: "Alejandro", apellido: "Martínez", email: "alejandro@ejemplo.com", password: "password123", categoriaInteres: "Tecnología", fechaRegistro: "2024-01-15T10:00:00Z" },
    { id: "usr_2", nombre: "Sofía", apellido: "Rodríguez", email: "sofia@ejemplo.com", password: "password123", categoriaInteres: "Coleccionables", fechaRegistro: "2024-04-12T14:30:00Z" },
    { id: "usr_3", nombre: "Carlos", apellido: "Ruiz", email: "carlos@ejemplo.com", password: "password123", categoriaInteres: "Vehículos", fechaRegistro: "2024-05-10T11:15:00Z" },
    { id: "usr_4", nombre: "Ana María", apellido: "Delgado", email: "ana@ejemplo.com", password: "password123", categoriaInteres: "Electrónica", fechaRegistro: "2024-01-20T09:45:00Z" },
    { id: "usr_5", nombre: "Javier", apellido: "Gómez", email: "javier@ejemplo.com", password: "password123", categoriaInteres: "Hogar", fechaRegistro: "2024-02-18T16:20:00Z" }
  ];

  const now = new Date();
  const addTime = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
  const subtractTime = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

  const mockProducts = [
    { id: "prod_1", vendedorId: "usr_3", vendedorNombre: "Carlos Ruiz", nombre: "Tesla Roadster 2024 - Prototype Alpha", categoria: "Vehículos", descripcion: "Este prototipo exclusivo representa el pináculo del rendimiento eléctrico con acabados en fibra de carbono mate y un interior aeroespacial personalizado.", imagen: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=600&auto=format&fit=crop", precioInicial: 200000, ofertaActual: 245500, liderActual: "usr_1", liderNombre: "Alejandro Martínez", fechaCreacion: subtractTime(48), fechaCierre: addTime(2.75), estado: "activa" },
    { id: "prod_2", vendedorId: "usr_4", vendedorNombre: "Ana María Delgado", nombre: "Rolex Submariner 2023 Oystersteel", categoria: "Coleccionables", descripcion: "Esfera negra de diseño icónico con bisel giratorio Cerachrom de cerámica negra. Estado impecable con caja oficial incluida.", imagen: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop", precioInicial: 10000, ofertaActual: 12450, liderActual: "usr_5", liderNombre: "Javier Gómez", fechaCreacion: subtractTime(24), fechaCierre: addTime(1.5), estado: "activa" },
    { id: "prod_3", vendedorId: "usr_5", vendedorNombre: "Javier Gómez", nombre: "Silla Eames Lounge Original 1970", categoria: "Hogar", descripcion: "Silla de descanso clásica de nogal y cuero de grano superior negro, con sello oficial de Herman Miller de la época.", imagen: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600&auto=format&fit=crop", precioInicial: 2500, ofertaActual: 3400, liderActual: "usr_1", liderNombre: "Alejandro Martínez", fechaCreacion: subtractTime(12), fechaCierre: addTime(0.53), estado: "activa" },
    { id: "prod_4", vendedorId: "usr_2", vendedorNombre: "Sofía Rodríguez", nombre: "MacBook Pro 16\" M2 Max (64GB, 2TB)", categoria: "Tecnología", descripcion: "Máxima configuración para creadores y desarrolladores. CPU de 12 núcleos y GPU de 38 núcleos. Sellado en caja originaria.", imagen: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop", precioInicial: 2200, ofertaActual: 3200, liderActual: "usr_4", liderNombre: "Ana María Delgado", fechaCreacion: subtractTime(30), fechaCierre: addTime(24), estado: "activa" },
    { id: "prod_14", vendedorId: "usr_1", vendedorNombre: "Alejandro Martínez", nombre: "Air Jordan 1 Retro High Travis Scott Mocha", categoria: "Ropa", descripcion: "Tenis originales Travis Scott Mocha con el logo invertido característico. Prístino estado con recibo oficial de compra.", imagen: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop", precioInicial: 800, ofertaActual: 1550, liderActual: "usr_2", liderNombre: "Sofía Rodríguez", fechaCreacion: subtractTime(75), fechaCierre: addTime(36), estado: "activa" },
    { id: "prod_9", vendedorId: "usr_2", vendedorNombre: "Sofía Rodríguez", nombre: "Leica M11 Black Paint Professional", categoria: "Coleccionables", descripcion: "Cámara telemétrica digital de 60 megapíxeles. Excelente estado de conservación, prácticamente nueva con caja y accesorios.", imagen: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600&auto=format&fit=crop", precioInicial: 5000, ofertaActual: 6200, liderActual: "usr_1", liderNombre: "Alejandro Martínez", fechaCreacion: subtractTime(120), fechaCierre: subtractTime(24), estado: "finalizada", ganadorNombre: "Alejandro Martínez", ofertaGanadora: 6200 }
  ];

  const mockOffers = [
    { idOferta: "ofr_1", idProducto: "prod_1", idUsuario: "usr_4", usuarioNombre: "Ana María Delgado", valor: 210000, fecha: subtractTime(40) },
    { idOferta: "ofr_2", idProducto: "prod_1", idUsuario: "usr_5", usuarioNombre: "Javier Gómez", valor: 220000, fecha: subtractTime(30) },
    { idOferta: "ofr_3", idProducto: "prod_1", idUsuario: "usr_1", usuarioNombre: "Alejandro Martínez", valor: 230000, fecha: subtractTime(20) },
    { idOferta: "ofr_4", idProducto: "prod_1", idUsuario: "usr_3", usuarioNombre: "Carlos Ruiz", valor: 240000, fecha: subtractTime(10) },
    { idOferta: "ofr_5", idProducto: "prod_1", idUsuario: "usr_1", usuarioNombre: "Alejandro Martínez", valor: 245500, fecha: subtractTime(2) },
    { idOferta: "ofr_6", idProducto: "prod_2", idUsuario: "usr_1", usuarioNombre: "Alejandro Martínez", valor: 11000, fecha: subtractTime(15) },
    { idOferta: "ofr_7", idProducto: "prod_2", idUsuario: "usr_5", usuarioNombre: "Javier Gómez", valor: 12450, fecha: subtractTime(2) },
    { idOferta: "ofr_8", idProducto: "prod_3", idUsuario: "usr_2", usuarioNombre: "Sofía Rodríguez", valor: 2700, fecha: subtractTime(10) },
    { idOferta: "ofr_9", idProducto: "prod_3", idUsuario: "usr_1", usuarioNombre: "Alejandro Martínez", valor: 3400, fecha: subtractTime(1) },
    { idOferta: "ofr_10", idProducto: "prod_9", idUsuario: "usr_1", usuarioNombre: "Alejandro Martínez", valor: 6200, fecha: subtractTime(30) }
  ];

  localStorage.setItem("usuarios", JSON.stringify(mockUsers));
  localStorage.setItem("productos", JSON.stringify(mockProducts));
  localStorage.setItem("ofertas", JSON.stringify(mockOffers));

  localStorage.setItem("notificaciones", JSON.stringify([
    { id: "not_1", mensaje: "¡Bienvenido a SubastaPro, la plataforma de subastas comerciales de alta precisión!", tipo: "success", fecha: subtractTime(1) },
    { id: "not_2", mensaje: "Ficha finalizada: La cámara Leica M11 tiene como ganador oficial a Alejandro Martínez.", tipo: "info", fecha: subtractTime(24) }
  ]));
}

function obtenerNotificaciones() {
  return getLocalStorage("notificaciones", []);
}

function agregarNotificacion(mensaje, tipo = "info") {
  const notificaciones = obtenerNotificaciones();
  const nueva = {
    id: `not_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    mensaje,
    tipo,
    fecha: new Date().toISOString()
  };
  notificaciones.unshift(nueva);
  if (notificaciones.length > 30) notificaciones.pop();
  setLocalStorage("notificaciones", notificaciones);
  return nueva;
}

function limpiarNotificaciones() {
  setLocalStorage("notificaciones", []);
}

// ==========================================
//          AUTHENTICATION LAYER
// ==========================================
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function registrarUsuario(usuario) {
  if (!usuario.nombre || !usuario.apellido || !usuario.email || !usuario.password) {
    return { success: false, message: "Todos los campos son obligatorios." };
  }
  if (!validateEmail(usuario.email)) {
    return { success: false, message: "El formato de correo es inválido." };
  }
  if (usuario.password.length < 8) {
    return { success: false, message: "La contraseña debe tener mínimo 8 caracteres." };
  }

  const usuarios = getLocalStorage("usuarios", []);
  if (usuarios.some(u => u.email.toLowerCase() === usuario.email.toLowerCase())) {
    return { success: false, message: "El correo electrónico ya está registrado." };
  }

  const nuevoUsuario = {
    ...usuario,
    id: `usr_${Date.now()}`,
    fechaRegistro: new Date().toISOString()
  };
  usuarios.push(nuevoUsuario);
  setLocalStorage("usuarios", usuarios);

  return { success: true, message: "Registro completado con éxito.", user: nuevoUsuario };
}

function iniciarSesion(email, password) {
  if (!email || !password) {
    return { success: false, message: "Por favor complete todos los campos." };
  }
  const usuarios = getLocalStorage("usuarios", []);
  const user = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return { success: false, message: "Correo electrónico o contraseña incorrectos." };
  }
  setLocalStorage("sesion", user);
  return { success: true, message: "Inicio de sesión correcto.", user };
}

function obtenerSesionActual() {
  return getLocalStorage("sesion", null);
}

function cerrarSesion() {
  localStorage.removeItem("sesion");
}

// ==========================================
//          PRODUCTS CATALOG MANAGEMENT
// ==========================================
function publicarProducto(producto, vendedorId, vendedorNombre) {
  if (!producto.nombre || !producto.categoria || !producto.descripcion || !producto.imagen || producto.precioInicial <= 0 || !producto.fechaCierre) {
    return { success: false, message: "Por favor complete todos los campos requeridos." };
  }
  const closingDate = new Date(producto.fechaCierre);
  if (closingDate.getTime() <= Date.now()) {
    return { success: false, message: "La fecha de cierre debe residir en el futuro." };
  }

  const productos = getLocalStorage("productos", []);
  const nuevoProducto = {
    ...producto,
    id: `prod_${Date.now()}`,
    vendedorId,
    vendedorNombre,
    ofertaActual: Number(producto.precioInicial),
    liderActual: null,
    liderNombre: null,
    fechaCreacion: new Date().toISOString(),
    fechaCierre: closingDate.toISOString(),
    estado: "activa"
  };
  productos.unshift(nuevoProducto);
  setLocalStorage("productos", productos);
  return { success: true, message: "Lote publicado exitosamente.", product: nuevoProducto };
}

function obtenerProductosModificados() {
  const productos = getLocalStorage("productos", []);
  let modificado = false;

  const actualizados = productos.map(p => {
    if (p.estado === "activa" && new Date(p.fechaCierre).getTime() <= Date.now()) {
      p.estado = "finalizada";
      modificado = true;
      const ofertas = getLocalStorage("ofertas", []);
      const ofertasProd = ofertas.filter(o => o.idProducto === p.id).sort((a, b) => b.valor - a.valor);
      
      if (ofertasProd.length > 0) {
        const ganadora = ofertasProd[0];
        p.ganadorNombre = ganadora.usuarioNombre;
        p.ofertaGanadora = ganadora.valor;
        p.liderActual = ganadora.idUsuario;
        p.liderNombre = ganadora.usuarioNombre;
        p.ofertaActual = ganadora.valor;
      } else {
        p.ganadorNombre = null;
        p.ofertaGanadora = null;
      }
    }
    return p;
  });

  if (modificado) {
    setLocalStorage("productos", actualizados);
  }
  return actualizados;
}

function buscarYFiltrarProductos(query, categoria, orden) {
  const productos = obtenerProductosModificados();
  let filtrados = productos.filter(p => p.estado === "activa");

  if (query && query.trim()) {
    const q = query.toLowerCase();
    filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q));
  }

  if (categoria && categoria !== "Todas" && categoria !== "Categorías") {
    filtrados = filtrados.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
  }

  if (orden === "highest") {
    filtrados.sort((a, b) => b.ofertaActual - a.ofertaActual);
  } else if (orden === "lowest") {
    filtrados.sort((a, b) => a.ofertaActual - b.ofertaActual);
  } else if (orden === "newest") {
    filtrados.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  } else if (orden === "ending") {
    filtrados.sort((a, b) => new Date(a.fechaCierre).getTime() - new Date(b.fechaCierre).getTime());
  }
  return filtrados;
}

function obtenerProductoPorId(id) {
  const productos = obtenerProductosModificados();
  return productos.find(p => p.id === id) || null;
}

function obtenerTodosLosProductos() {
  return obtenerProductosModificados();
}

// ==========================================
//          OFFERS / BID SERVICES
// ==========================================
function realizarOferta(idProducto, idUsuario, usuarioNombre, monto) {
  if (monto <= 0 || isNaN(monto)) {
    return { success: false, message: "El monto debe ser un número positivo." };
  }

  const productos = obtenerProductosModificados();
  const pIdx = productos.findIndex(p => p.id === idProducto);
  if (pIdx === -1) return { success: false, message: "Lote no encontrado." };

  const producto = productos[pIdx];
  if (producto.estado === "finalizada") {
    return { success: false, message: "Esta subasta ya ha finalizado.", subastaFinalizada: true };
  }

  const deLaOfertaEsperada = Math.max(producto.ofertaActual, producto.precioInicial);
  if (monto <= deLaOfertaEsperada) {
    return { success: false, message: `La puja debe superar la oferta actual de $${deLaOfertaEsperada.toLocaleString()}.` };
  }

  const ofertas = getLocalStorage("ofertas", []);
  const nuevaOferta = {
    idOferta: `ofr_${Date.now()}`,
    idProducto,
    idUsuario,
    usuarioNombre,
    valor: Number(monto),
    fecha: new Date().toISOString()
  };
  ofertas.push(nuevaOferta);
  setLocalStorage("ofertas", ofertas);

  producto.ofertaActual = Number(monto);
  producto.liderActual = idUsuario;
  producto.liderNombre = usuarioNombre;

  const deCierre = new Date(producto.fechaCierre);
  const diffMs = deCierre.getTime() - Date.now();
  const dosMinutos = 2 * 60 * 1000;

  if (diffMs > 0 && diffMs <= dosMinutos) {
    producto.fechaCierre = new Date(deCierre.getTime() + dosMinutos).toISOString();
  }

  setLocalStorage("productos", productos);
  return { success: true, message: "¡Oferta colocada exitosamente! Eres el líder." };
}

function obtenerHistorialDeOfertas(idProducto) {
  const ofertas = getLocalStorage("ofertas", []);
  return ofertas.filter(o => o.idProducto === idProducto).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

function obtenerOfertasPorUsuario(idUsuario) {
  const ofertas = getLocalStorage("ofertas", []);
  const productos = obtenerProductosModificados();
  const filtradas = ofertas.filter(o => o.idUsuario === idUsuario);

  const bidsMap = {};
  filtradas.forEach(o => {
    if (!bidsMap[o.idProducto]) bidsMap[o.idProducto] = [];
    bidsMap[o.idProducto].push(o);
  });

  const resultados = [];
  Object.keys(bidsMap).forEach(prodId => {
    const prod = productos.find(p => p.id === prodId);
    if (!prod) return;

    const bidsSorted = bidsMap[prodId].sort((a, b) => b.valor - a.valor);
    const maxVal = bidsSorted[0].valor;

    let estado = "Superado";
    if (prod.estado === "activa") {
      if (prod.liderActual === idUsuario) estado = "Ganando";
    } else {
      estado = prod.liderActual === idUsuario ? "Ganado" : "Perdido";
    }

    resultados.push({
      producto: prod,
      ofertaActualUsuario: maxVal,
      estadoPujador: estado,
      fechaOferta: bidsSorted[0].fecha
    });
  });

  return resultados.sort((a, b) => new Date(b.fechaOferta).getTime() - new Date(a.fechaOferta).getTime());
}

// ==========================================
//          APPLICATION GLOBAL STATE
// ==========================================
let loggedUser = null;
let currentScreen = "browse";
let selectedProduct = null;
let activeCategory = "Todas";
let searchQuery = "";
let orderBy = "ending";
let activeSubTab = "bids";
let quickBidSelectedProduct = null;

const CATEGORIES_LIST = ["Todas", "Tecnología", "Electrónica", "Vehículos", "Hogar", "Ropa", "Deportes", "Coleccionables", "Herramientas", "Otros"];

const PREMIUM_STOCK_ITEMS = [
  { nombre: "McLaren P1 Hybrid Hypercar 2015", categoria: "Vehículos", descripcion: "Una de las 375 unidades producidas. Chasis monocasco de carbono MonoCage.", imagen: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=600&auto=format&fit=crop" },
  { nombre: "IPhone 16 Pro Max - Custom 24k Gold", categoria: "Tecnología", descripcion: "Edición limitada de 24k de oro. Certificado Caviar y 1TB.", imagen: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop" },
  { nombre: "Cámara Retro Linhof Technika V Vintage", categoria: "Coleccionables", descripcion: "Hermosa cámara alemana vintage de fuelle para coleccionistas analógicos.", imagen: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=600&auto=format&fit=crop" }
];

// ==========================================
//          APPLICATION CONTROL LIFECYCLE
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  seedMockData();
  loggedUser = obtenerSesionActual();
  if (loggedUser) {
    showAppLayout();
  } else {
    showAuthLayout();
  }
  setupCoreEventListeners();
  startBackgroundServices();
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 150);
});

function showAuthLayout() {
  document.getElementById("auth-stack").classList.remove("hidden");
  document.getElementById("app-stack").classList.add("hidden");
  showAuthView("login");
}

function showAppLayout() {
  document.getElementById("auth-stack").classList.add("hidden");
  document.getElementById("app-stack").classList.remove("hidden");
  updateHeaderUserInfo();
  navigateToScreen("browse");
}

function showAuthView(view) {
  if (view === "login") {
    document.getElementById("login-view").classList.remove("hidden");
    document.getElementById("register-view").classList.add("hidden");
    document.getElementById("login-error").classList.add("hidden");
  } else {
    document.getElementById("login-view").classList.add("hidden");
    document.getElementById("register-view").classList.remove("hidden");
    document.getElementById("register-error").classList.add("hidden");
    resetRegisterForm();
  }
}

function updateHeaderUserInfo() {
  if (!loggedUser) return;
  document.getElementById("header-user-fullname").innerText = `${loggedUser.nombre} ${loggedUser.apellido}`;
  document.getElementById("header-user-email").innerText = loggedUser.email;
  const init = `${loggedUser.nombre.charAt(0)}${loggedUser.apellido.charAt(0)}`.toUpperCase();
  document.getElementById("header-user-avatar").innerText = init;
  document.getElementById("profile-avatar-large").innerText = init;
}

function navigateToScreen(screen) {
  currentScreen = screen;
  
  document.getElementById("screen-browse").classList.add("hidden");
  document.getElementById("screen-detail").classList.add("hidden");
  document.getElementById("screen-my-auctions").classList.add("hidden");
  document.getElementById("screen-admin").classList.add("hidden");
  
  const target = document.getElementById(`screen-${screen}`);
  if (target) target.classList.remove("hidden");

  // Nav buttons states
  const btnBrowse = document.getElementById("nav-btn-browse");
  const btnMy = document.getElementById("nav-btn-my-auctions");
  const btnAdmin = document.getElementById("nav-btn-admin");
  const activeClass = ["bg-primary-container-base/15", "text-white", "border", "border-[#cfbdff]/20"];
  const inactiveClass = ["text-on-surface-variant", "hover:bg-surface-variant/40", "hover:text-on-surface"];

  [btnBrowse, btnMy, btnAdmin].forEach(btn => {
    activeClass.forEach(c => btn.classList.remove(c));
    inactiveClass.forEach(c => btn.classList.remove(c));
    inactiveClass.forEach(c => btn.classList.add(c));
  });

  // Mobile navigation states
  const mBrowse = document.getElementById("mob-nav-browse");
  const mMy = document.getElementById("mob-nav-my-auctions");
  const mAdmin = document.getElementById("mob-nav-admin");
  const mActive = ["text-[#cfbdff]", "bg-primary-container-base/20"];
  const mInactive = ["text-on-surface-variant", "hover:text-white"];

  [mBrowse, mMy, mAdmin].forEach(btn => {
    btn.className = "flex flex-col items-center justify-center p-2 rounded-xl text-[10px]";
    mInactive.forEach(c => btn.classList.add(c));
  });

  if (screen === "browse") {
    activeClass.forEach(c => btnBrowse.classList.remove(c));
    activeClass.forEach(c => btnBrowse.classList.add(c));
    mInactive.forEach(c => mBrowse.classList.remove(c));
    mActive.forEach(c => mBrowse.classList.add(c));
    renderBrowseCatalog();
  } else if (screen === "detail") {
    renderProductDetail();
  } else if (screen === "my-auctions") {
    activeClass.forEach(c => btnMy.classList.remove(c));
    activeClass.forEach(c => btnMy.classList.add(c));
    mInactive.forEach(c => mMy.classList.remove(c));
    mActive.forEach(c => mMy.classList.add(c));
    renderMyAuctionsView();
  } else if (screen === "admin") {
    activeClass.forEach(c => btnAdmin.classList.remove(c));
    activeClass.forEach(c => btnAdmin.classList.add(c));
    mInactive.forEach(c => mAdmin.classList.remove(c));
    mActive.forEach(c => mAdmin.classList.add(c));
    renderAdminOverview();
  }
  
  updateUnreadNotifications();
  if (window.lucide) window.lucide.createIcons();
}

// ==========================================
//          DYNAMIC VIEWS RENDERERS
// ==========================================
function renderBrowseCatalog() {
  const catCon = document.getElementById("category-pills-container");
  catCon.innerHTML = "";
  
  CATEGORIES_LIST.forEach(cat => {
    const act = activeCategory === cat;
    const btn = document.createElement("button");
    btn.className = `w-full flex items-center justify-between text-left text-xs font-bold py-3 px-3.5 rounded-lg transition-all cursor-pointer ${
      act ? "bg-primary-container-base/30 text-white border-l-4 border-[#cfbdff]" : "text-on-surface-variant hover:bg-[#191c1e] hover:text-on-surface"
    }`;
    btn.innerHTML = `<span>${cat}</span><i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>`;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderBrowseCatalog();
    });
    catCon.appendChild(btn);
  });

  const badge = document.getElementById("current-active-filter-badge");
  const badgeText = document.getElementById("active-filter-text-label");
  if (activeCategory !== "Todas") {
    badge.classList.remove("hidden");
    badgeText.innerText = activeCategory;
  } else {
    badge.classList.add("hidden");
  }

  const list = buscarYFiltrarProductos(searchQuery, activeCategory, orderBy);
  document.getElementById("catalog-counts-badge").innerText = list.length;

  const grid = document.getElementById("products-grid-container");
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center glass-panel rounded-2xl flex flex-col justify-center items-center gap-4">
        <i data-lucide="shopping-bag" class="w-12 h-12 text-on-surface-variant"></i>
        <div>
          <h4 class="text-sm font-bold text-white uppercase tracking-wider">Sin lotes activos</h4>
          <p class="text-xs text-[#abb9d6] mt-1">No se hallaron subastas disponibles como "${activeCategory}".</p>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "group bg-[#101415] border border-outline-variant/75 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:border-primary-base/40 transition-all duration-300 flex flex-col h-full relative";
    
    const diff = new Date(p.fechaCierre).getTime() - Date.now();
    const isOver = diff <= 0;
    const isSoon = !isOver && diff < 60 * 60 * 1000;
    
    let stateBadge = `<span class="absolute top-3 right-3 bg-green-950/95 border border-green-700/50 text-[10px] font-bold text-green-400 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">● Activa</span>`;
    if (isOver) {
      stateBadge = `<span class="absolute top-3 right-3 bg-red-950/90 border border-red-700/50 text-[10px] font-bold text-red-400 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">❌ Cerrado</span>`;
    } else if (isSoon) {
      stateBadge = `<span class="absolute top-3 right-3 bg-yellow-950/90 border border-yellow-700/50 text-[10px] font-bold text-yellow-500 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md animate-pulse">⏳ Inminente</span>`;
    }

    card.innerHTML = `
      <div class="relative aspect-video w-full overflow-hidden bg-black/40">
        <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" src="${p.imagen}" alt="${p.nombre}" />
        <span class="absolute top-3 left-3 bg-[#0b0f10]/85 border border-outline-variant text-[10px] font-bold text-[#4cd6fb] px-2.5 py-1 rounded tracking-wider uppercase backdrop-blur-md">${p.categoria}</span>
        ${stateBadge}
        <div class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-center text-xs">
          <span class="text-[#abb9d6] font-medium flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5 text-primary-base"></i> Cierre:</span>
          <span class="font-mono font-bold countdown-span text-[11px]" data-expiry="${p.fechaCierre}">Calculando...</span>
        </div>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-bold text-white hover:text-primary-base transition-colors duration-200 cursor-pointer line-clamp-1 mb-1.5" id="title-p-${p.id}">${p.nombre}</h3>
          <p class="text-[11px] text-[#abb9d6] line-clamp-3 mb-4 leading-relaxed">${p.descripcion}</p>
        </div>
        <div>
          <div class="grid grid-cols-2 gap-2 border-t border-b border-outline-variant/60 py-3.5 mb-4 bg-surface-container-high/10 px-2 rounded-lg">
            <div>
              <span class="text-[9px] uppercase font-bold tracking-wider text-[#abb9d6] block mb-0.5">Inicial</span>
              <span class="text-xs font-semibold text-white">$${p.precioInicial.toLocaleString("es-MX")}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase font-bold tracking-wider text-[#abb9d6] block mb-0.5">Lote Líder</span>
              <span class="text-xs font-black text-tertiary-base">$${p.ofertaActual.toLocaleString("es-MX")}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-4 text-[10px] font-medium text-on-surface-variant bg-[#191c1e] px-2.5 py-1.5 rounded border border-outline-variant/60">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-primary-base"></span>
            <span>Líder activo:</span>
            <span class="font-bold text-white truncate flex-1">${p.liderNombre || "Por asignar"}</span>
          </div>
          <div class="flex gap-2">
            <button class="flex-1 border border-outline-variant text-[#e0e3e5] hover:bg-slate-800 font-semibold text-xs py-2.5 rounded-lg transition-all cursor-pointer" id="btn-fiche-p-${p.id}">Ficha</button>
            <button class="flex-[2] bg-[#6200ee] hover:bg-opacity-92 disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-extrabold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md" id="btn-bid-p-${p.id}" ${isOver ? "disabled" : ""}>
              <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> Ofertar
            </button>
          </div>
        </div>
      </div>
    `;

    card.querySelector(`#title-p-${p.id}`).addEventListener("click", () => { selectedProduct = p; navigateToScreen("detail"); });
    card.querySelector(`#btn-fiche-p-${p.id}`).addEventListener("click", () => { selectedProduct = p; navigateToScreen("detail"); });
    card.querySelector(`#btn-bid-p-${p.id}`).addEventListener("click", (e) => { e.stopPropagation(); openQuickBidModal(p); });
    grid.appendChild(card);
  });
  tickCountdownClocks();
  if (window.lucide) window.lucide.createIcons();
}

function renderProductDetail() {
  const container = document.getElementById("detail-view-content");
  container.innerHTML = "";
  if (!selectedProduct) return;

  const p = obtenerProductoPorId(selectedProduct.id);
  selectedProduct = p;
  
  const diff = new Date(p.fechaCierre).getTime() - Date.now();
  const isOver = p.estado === "finalizada" || diff <= 0;
  const isSoon = !isOver && diff < 60 * 60 * 1000;
  const expectedMin = Math.max(p.ofertaActual, p.precioInicial) + 1;
  const historia = obtenerHistorialDeOfertas(p.id);

  container.innerHTML = `
    <div class="grid lg:grid-cols-12 gap-8 items-start">
      <div class="lg:col-span-7 space-y-6">
        <div class="glass-panel rounded-2xl overflow-hidden p-3 shadow-lg">
          <div class="relative aspect-video rounded-xl overflow-hidden bg-black/60">
            <img src="${p.imagen}" alt="${p.nombre}" class="w-full h-full object-cover" />
            <span class="absolute top-4 left-4 bg-primary-base text-[#3a0093] text-[10px] font-black uppercase px-3 py-1.5 rounded tracking-wider shadow-md">Lote ID: ${p.id}</span>
          </div>
        </div>
        <div class="glass-panel p-6 rounded-2xl space-y-4">
          <h3 class="font-sans font-extrabold text-base text-white">Especificaciones de Catálogo</h3>
          <p class="text-xs text-[#abb9d6] pr-2 leading-relaxed whitespace-pre-line">${p.descripcion}</p>
          <div class="pt-4 grid grid-cols-2 gap-4 border-t border-outline-variant/60 text-xs">
            <div>
              <span class="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-widest mb-1">Categoría del lote</span>
              <strong class="text-tertiary-base text-xs font-bold">${p.categoria}</strong>
            </div>
            <div>
              <span class="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-widest mb-1">Ofertante Emisor</span>
              <span class="font-bold text-white text-xs">${p.vendedorNombre || "Subastador Oficial"}</span>
            </div>
          </div>
        </div>
        <div class="glass-panel p-6 rounded-2xl">
          <h3 class="font-sans font-bold text-sm text-white mb-4 flex items-center gap-2">
            <i data-lucide="trending-up" class="w-4 h-4 text-[#4cd6fb]"></i> Bitácora de Pujas de Garantía (${historia.length})
          </h3>
          <div id="timeline-scrollable-container" class="space-y-2.5 max-h-[250px] overflow-y-auto pr-2"></div>
        </div>
      </div>
      <div class="lg:col-span-5 space-y-6">
        <div class="glass-panel p-6 rounded-2xl bg-gradient-to-b from-surface-container-high/60 to-surface-container-low border border-outline-variant/80 shadow-2xl">
          <span class="text-xs font-extrabold uppercase tracking-widest text-[#cfbdff] flex items-center gap-1.5 mb-2.5">
            <i data-lucide="clock" class="w-4 h-4 text-[#cfbdff]"></i> Reloj de Precisión de Cierre
          </span>
          <div id="detail-timer-placement"></div>
        </div>
        <div class="glass-panel p-6 rounded-2xl border border-outline-variant">
          <h2 class="font-sans font-black text-xl text-white mr-1 leading-snug line-clamp-2">${p.nombre}</h2>
          <div class="flex justify-between items-center p-4 rounded-xl bg-[#14181a] border border-outline-variant/50 my-5">
            <div>
              <span class="text-[9px] text-[#abb9d6] uppercase font-bold tracking-wider">Última Propuesta Registrada</span>
              <span class="block text-2xl font-black text-[#4cd6fb] mt-1 pr-1 font-mono">$${p.ofertaActual.toLocaleString("es-MX")}</span>
            </div>
            <div class="text-right">
              <span class="text-[9px] text-[#abb9d6] uppercase font-bold tracking-wider block">Líder Activo</span>
              <span class="text-xs font-bold text-white block mt-1 truncate max-w-[150px]">${p.liderNombre || "Ninguno"}</span>
            </div>
          </div>
          <div id="detail-bidding-area"></div>
        </div>
      </div>
    </div>
  `;

  const timelineLogs = container.querySelector("#timeline-scrollable-container");
  if (historia.length === 0) {
    timelineLogs.innerHTML = `<div class="text-center py-8 text-xs text-on-surface-variant bg-[#191c1e] rounded-xl border border-dashed border-outline-variant">No hay ofertas de postores aún. ¡Sé el primero!</div>`;
  } else {
    historia.forEach((o, idx) => {
      const isLeader = idx === 0 && !isOver;
      const tItem = document.createElement("div");
      tItem.className = `flex justify-between items-center p-3 rounded-lg border transition-all ${isLeader ? "bg-primary-container-base/15 border-primary-base/40 text-white" : "bg-[#14181a] border-outline-variant/40"}`;
      tItem.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="w-2.5 h-2.5 rounded-full ${isLeader ? 'bg-[#cfbdff] animate-ping' : 'bg-outline-variant'}"></div>
          <div>
            <span class="text-xs font-bold text-[#e0e3e5] block">${o.usuarioNombre}</span>
            <span class="text-[9px] text-[#abb9d6] font-mono block mt-0.5">${new Date(o.fecha).toLocaleDateString()} ${new Date(o.fecha).toLocaleTimeString()}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs font-black ${isLeader ? 'text-tertiary-base' : 'text-[#abb9d6]'}">$${o.valor.toLocaleString("es-MX")}</span>
          ${isLeader ? '<span class="block text-[8px] font-extrabold text-green-400 mt-0.5 tracking-wider uppercase">LÍDER</span>' : ''}
        </div>
      `;
      timelineLogs.appendChild(tItem);
    });
  }

  const timerPlacer = container.querySelector("#detail-timer-placement");
  if (isOver) {
    timerPlacer.innerHTML = `
      <div class="bg-red-950/40 border border-red-800/80 rounded-xl p-4 text-center mt-3">
        <span class="text-sm font-extrabold text-red-400 block tracking-wider uppercase">SUBASTA CERRADA</span>
        ${p.ganadorNombre ? `
          <div class="pt-3.5 mt-3.5 border-t border-red-800/30">
            <span class="text-[10px] font-bold text-gray-400 block uppercase">Inversor Ganador Adjudicado:</span>
            <span class="text-base font-black text-tertiary-base block mt-1">${p.ganadorNombre}</span>
            <span class="text-[10px] text-on-surface-variant block mt-0.5">Finiquitado en: <strong>$${(p.ofertaGanadora || p.ofertaActual).toLocaleString("es-MX")}</strong></span>
          </div>
        ` : `<div class="pt-3 mt-3 border-t border-red-800/20 text-xs text-[#abb9d6]">No se registraron ofertas formales.</div>`}
      </div>
    `;
  } else {
    timerPlacer.innerHTML = `
      <div class="grid grid-cols-4 gap-2 text-center my-4 font-mono select-none" id="countdown-wrapper-detail" data-expiry="${p.fechaCierre}">
        <div class="bg-[#121617]/90 border border-outline-variant p-2.5 rounded-lg"><span class="block text-lg font-extrabold text-white" id="detail-d">0</span><span class="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Días</span></div>
        <div class="bg-[#121617]/90 border border-outline-variant p-2.5 rounded-lg"><span class="block text-lg font-extrabold text-white" id="detail-h">00</span><span class="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Horas</span></div>
        <div class="bg-[#121617]/90 border border-outline-variant p-2.5 rounded-lg"><span class="block text-lg font-extrabold text-white" id="detail-m">00</span><span class="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Mins</span></div>
        <div class="bg-primary-container-base/15 border border-[#cfbdff]/20 p-2.5 rounded-lg relative overflow-hidden">
          <span class="block text-lg font-extrabold text-[#cfbdff] ${isSoon ? 'text-yellow-400 animate-pulse' : ''}" id="detail-s">00</span>
          <span class="text-[8px] uppercase font-bold text-[#cfbdff] tracking-wider">Segs</span>
        </div>
      </div>
    `;
    tickDetailsCountdown();
  }

  const biddingArea = container.querySelector("#detail-bidding-area");
  if (isOver) {
    biddingArea.innerHTML = `<div class="text-xs text-center text-[#abb9d6] py-3 uppercase tracking-wider font-semibold">Subasta Mercantil Finiquitada</div>`;
  } else if (p.vendedorId === loggedUser.id) {
    biddingArea.innerHTML = `<div class="bg-primary-container-base/10 border border-primary-base/20 rounded-xl p-4 text-center"><span class="text-xs font-semibold text-white block">Eres el propietario de este artículo</span><p class="text-[10px] text-on-surface-variant mt-1">Socio emisor no habilitado para auto-pujar.</p></div>`;
  } else {
    biddingArea.innerHTML = `
      <form id="detail-bidding-form" class="space-y-4">
        <div id="detail-bid-form-error" class="hidden bg-red-950/60 border border-red-800 text-red-200 p-3 rounded-lg text-xs"></div>
        <div>
          <label class="text-[10px] font-semibold text-on-surface-variant block mb-2" for="detail-bid-input-box">Monto de puja sugerido (Mínimo: $${expectedMin.toLocaleString()})</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
            <input type="number" id="detail-bid-input-box" class="w-full bg-[#101415] border border-outline-variant text-[13px] text-on-surface rounded-lg py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary-base outline-none font-semibold" placeholder="${expectedMin}" required />
          </div>
        </div>
        <button type="submit" class="w-full bg-[#6200ee] hover:bg-opacity-95 text-white font-extrabold text-xs py-3.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg">Colocar Oferta de Licitación</button>
      </form>
    `;

    biddingArea.querySelector("#detail-bidding-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const errBox = document.getElementById("detail-bid-form-error");
      errBox.classList.add("hidden");
      const val = parseFloat(document.getElementById("detail-bid-input-box").value);
      if (!val || isNaN(val)) {
        errBox.classList.remove("hidden");
        errBox.innerText = "Por favor ingresa un monto válido.";
        return;
      }
      const res = realizarOferta(p.id, loggedUser.id, `${loggedUser.nombre} ${loggedUser.apellido}`, val);
      if (res.success) {
        showToast(res.message, "success");
        agregarNotificacion(`Lanzaste una puja certificada de $${val.toLocaleString()} en "${p.nombre}".`, "success");
        renderProductDetail();
      } else {
        errBox.classList.remove("hidden");
        errBox.innerText = res.message;
      }
    });
  }

  if (window.lucide) window.lucide.createIcons();
}

function renderMyAuctionsView() {
  const balance = getLocalStorage(`balance_usr_${loggedUser.id}`, 25000);
  document.getElementById("profile-wallet-balance").innerText = `$${balance.toLocaleString("es-MX")}`;
  document.getElementById("profile-user-fullname").innerText = `${loggedUser.nombre} ${loggedUser.apellido}`;
  document.getElementById("profile-user-meta").innerText = `Inversor Certificado • ${loggedUser.email}`;

  const tabBids = document.getElementById("my-auctions-tab-bids");
  const tabSales = document.getElementById("my-auctions-tab-sales");
  const tabRefill = document.getElementById("my-auctions-tab-refill");

  const act = ["bg-primary-container-base/30", "text-white", "border-l-4", "border-primary-base"];
  const inact = ["text-on-surface-variant", "hover:bg-[#191c1e]", "hover:text-on-surface"];

  [tabBids, tabSales, tabRefill].forEach(btn => {
    act.forEach(c => btn.classList.remove(c));
    inact.forEach(c => btn.classList.remove(c));
    inact.forEach(c => btn.classList.add(c));
  });

  const refillBox = document.getElementById("warranty-refill-panel");
  if (activeSubTab === "bids") {
    act.forEach(c => tabBids.classList.add(c));
    refillBox.classList.add("hidden");
  } else if (activeSubTab === "sales") {
    act.forEach(c => tabSales.classList.add(c));
    refillBox.classList.add("hidden");
  } else if (activeSubTab === "transactions") {
    act.forEach(c => tabRefill.classList.add(c));
    refillBox.classList.remove("hidden");
  }

  const userBids = obtenerOfertasPorUsuario(loggedUser.id);
  document.getElementById("user-bids-count-label").innerText = userBids.length;

  const allProducts = getLocalStorage("productos", []);
  const mySales = allProducts.filter(p => p.vendedorId === loggedUser.id);
  document.getElementById("user-sales-count-label").innerText = mySales.length;

  const cardHolder = document.getElementById("user-portfolio-details-card");
  cardHolder.innerHTML = "";

  if (activeSubTab === "bids") {
    cardHolder.innerHTML = `<h3 class="font-sans font-bold text-sm text-white px-1 uppercase tracking-wider mb-2">Historial de Licitaciones</h3>`;
    if (userBids.length === 0) {
      cardHolder.innerHTML += `<div class="glass-panel py-12 text-center rounded-2xl p-4 text-xs text-on-surface-variant">No has colocado propuestas formales aún.</div>`;
    } else {
      userBids.forEach(item => {
        const itemCard = document.createElement("div");
        itemCard.className = "glass-panel p-4 rounded-xl border border-outline-variant hover:border-primary-base/35 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2";
        let colorTheme = "bg-green-950/80 text-green-400";
        if (item.estadoPujador === "Superado") colorTheme = "bg-orange-950/80 text-orange-400";
        else if (item.estadoPujador === "Ganado") colorTheme = "bg-yellow-950/80 text-yellow-500";
        else if (item.estadoPujador === "Perdido") colorTheme = "bg-red-950/85 text-red-400";

        itemCard.innerHTML = `
          <div class="flex gap-4 items-center">
            <img src="${item.producto.imagen}" class="w-12 h-12 object-cover rounded-lg" />
            <div>
              <h4 class="text-xs font-black text-white hover:text-primary-base cursor-pointer line-clamp-1" id="link-p-${item.producto.id}">${item.producto.nombre}</h4>
              <p class="text-[9px] text-[#abb9d6] mt-1 font-semibold">Puja emitida el: ${new Date(item.fechaOferta).toLocaleDateString()}</p>
              <span class="inline-block border text-[8px] font-black px-2 py-0.5 rounded-sm mt-1.5 uppercase ${colorTheme}">${item.estadoPujador}</span>
            </div>
          </div>
          <div class="flex justify-between items-center w-full md:w-auto md:text-right gap-6 pt-2 md:pt-0 font-mono">
            <div><span class="text-[8px] text-on-surface-variant block">Tu Puja</span><span class="text-xs font-extrabold text-tertiary-base">$${item.ofertaActualUsuario.toLocaleString()}</span></div>
            <div><span class="text-[8px] text-on-surface-variant block">Lote Líder</span><span class="text-xs font-black text-white">$${item.producto.ofertaActual.toLocaleString()}</span></div>
            <button class="bg-[#191c1e] hover:bg-slate-800 p-2 rounded-lg border border-outline-variant cursor-pointer text-on-surface" id="btn-view-item-${item.producto.id}"><i data-lucide="eye" class="w-4 h-4"></i></button>
          </div>
        `;
        itemCard.querySelector(`#link-p-${item.producto.id}`).addEventListener("click", () => { selectedProduct = item.producto; navigateToScreen("detail"); });
        itemCard.querySelector(`#btn-view-item-${item.producto.id}`).addEventListener("click", () => { selectedProduct = item.producto; navigateToScreen("detail"); });
        cardHolder.appendChild(itemCard);
      });
    }
  } else if (activeSubTab === "sales") {
    cardHolder.innerHTML = `<h3 class="font-sans font-bold text-sm text-white px-1 uppercase tracking-wider mb-2">Tus Publicaciones</h3>`;
    if (mySales.length === 0) {
      cardHolder.innerHTML += `<div class="glass-panel py-12 text-center rounded-2xl p-4 text-xs text-on-surface-variant">No has cargado lotes mercantiles bajo tu cuenta digital.</div>`;
    } else {
      mySales.forEach(p => {
        const itemCard = document.createElement("div");
        itemCard.className = "glass-panel p-5 rounded-xl border border-outline-variant hover:border-primary-base/35 transition-all mb-2";
        const isClosed = p.estado === "finalizada";
        itemCard.innerHTML = `
          <div class="flex justify-between items-start gap-4 flex-col sm:flex-row">
            <div class="flex gap-4 items-center">
              <img src="${p.imagen}" class="w-12 h-12 object-cover rounded-lg" />
              <div>
                <h4 class="text-xs font-black text-white hover:text-primary-base cursor-pointer" id="link-p-sale-${p.id}">${p.nombre}</h4>
                <p class="text-[9px] text-[#abb9d6] mt-1">Cierre: ${new Date(p.fechaCierre).toLocaleString()}</p>
                <div class="mt-2"><span class="${isClosed ? 'bg-red-950 text-red-400' : 'bg-green-950 text-green-400'} text-[8px] font-extrabold px-2 py-0.5 rounded border border-outline-variant uppercase">${p.estado}</span></div>
              </div>
            </div>
            <div class="flex items-center gap-6 font-mono">
              <div><span class="text-[8px] text-on-surface-variant block">Lote Líder</span><span class="text-xs font-black text-tertiary-base">$${p.ofertaActual.toLocaleString()}</span></div>
              <button class="bg-[#191c1e] hover:bg-slate-800 p-2 rounded-lg border border-outline-variant cursor-pointer text-on-surface" id="btn-view-sale-${p.id}"><i data-lucide="eye" class="w-4 h-4"></i></button>
            </div>
          </div>
        `;
        itemCard.querySelector(`#link-p-sale-${p.id}`).addEventListener("click", () => { selectedProduct = p; navigateToScreen("detail"); });
        itemCard.querySelector(`#btn-view-sale-${p.id}`).addEventListener("click", () => { selectedProduct = p; navigateToScreen("detail"); });
        cardHolder.appendChild(itemCard);
      });
    }
  } else if (activeSubTab === "transactions") {
    cardHolder.innerHTML = `
      <div class="glass-panel p-6 rounded-2xl border border-outline-variant space-y-4">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><i data-lucide="shield-check" class="w-5 h-5 text-primary-base"></i> Normativas de Garantías Mercantiles</h3>
        <p class="text-xs text-on-surface-variant leading-relaxed">Para resguardar el carácter legal de las licitaciones corporativas, los clientes de SubastaPro deben fondear una cuenta de garantía mercantil para respaldar las adquisiciones de bienes de alto perfil comercial.</p>
        <div class="grid grid-cols-2 gap-4 pt-2 text-xs">
          <div class="p-3 bg-[#14181a] border border-outline-variant rounded-lg"><span class="font-bold text-white">Abono inmediato</span><p class="text-[10px] text-on-surface-variant mt-1">Los montos fondeados se habilitan automáticamente.</p></div>
          <div class="p-3 bg-[#14181a] border border-outline-variant rounded-lg"><span class="font-bold text-white">Retiro Autorizado</span><p class="text-[10px] text-on-surface-variant mt-1">Garantiza reembolsos libres de penalizaciones mercantiles.</p></div>
        </div>
      </div>
    `;
  }
  if (window.lucide) window.lucide.createIcons();
}

function renderAdminOverview() {
  const list = obtenerTodosLosProductos();
  const activas = list.filter(p => p.estado === "activa");
  const finalizadas = list.filter(p => p.estado === "finalizada");
  
  document.getElementById("admin-kpi-vivas").innerText = activas.length;
  const winsVol = finalizadas.reduce((acc, curr) => acc + (curr.ofertaGanadora || curr.ofertaActual || 0), 0);
  document.getElementById("admin-kpi-volumen").innerText = `$${(1324500 + winsVol).toLocaleString("es-MX")}`;

  const bidsContain = document.getElementById("admin-recent-bids-contain");
  bidsContain.innerHTML = "";
  const ofertas = getLocalStorage("ofertas", []);
  const top8 = [...ofertas].sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 8);

  if (top8.length === 0) {
    bidsContain.innerHTML = `<p class="text-xs text-on-surface-variant py-4 text-center">Sin transacciones registradas.</p>`;
  } else {
    top8.forEach(b => {
      const bDiv = document.createElement("div");
      bDiv.className = "p-3 bg-[#101415]/60 hover:bg-[#191c1e] text-xs border border-outline-variant/55 rounded-lg flex items-center justify-between gap-3 transition-all";
      bDiv.innerHTML = `
        <div>
          <span class="font-bold text-white block">${b.usuarioNombre}</span>
          <span class="text-[10px] text-tertiary-base block mt-0.5">Lote: ${b.idProducto}</span>
        </div>
        <div class="text-right font-mono">
          <span class="font-bold text-[#cfbdff]">$${b.valor.toLocaleString()}</span>
          <span class="text-[8px] text-green-400 block tracking-widest uppercase">AUDITADO</span>
        </div>
      `;
      bidsContain.appendChild(bDiv);
    });
  }

  const closedContain = document.getElementById("admin-closed-auctions-contain");
  closedContain.innerHTML = "";
  if (finalizadas.length === 0) {
    closedContain.innerHTML = `<p class="text-xs text-on-surface-variant py-6 text-center">Aguardando cierre de subastas activas.</p>`;
  } else {
    finalizadas.forEach(p => {
      const row = document.createElement("div");
      row.className = "p-4 bg-[#14181a]/85 hover:bg-[#191c1e] border border-outline-variant rounded-xl flex justify-between items-center gap-4 hover:border-primary-base/40 transition-all";
      row.innerHTML = `
        <div class="flex items-center gap-3.5 min-w-0">
          <img src="${p.imagen}" class="w-10 h-10 object-cover rounded-md flex-shrink-0" />
          <div class="truncate">
            <h4 class="text-xs font-bold text-[#cfbdff] hover:underline cursor-pointer truncate" id="link-admin-p-${p.id}">${p.nombre}</h4>
            <p class="text-[9px] text-[#abb9d6] mt-1">Ganador: <strong class="text-white">${p.ganadorNombre || "Sin Ofertas"}</strong></p>
          </div>
        </div>
        <div class="text-right font-mono flex-shrink-0">
          <span class="text-xs font-black text-white block">$${(p.ofertaGanadora || p.ofertaActual).toLocaleString("es-MX")}</span>
          <span class="inline-block bg-[#005c70]/20 text-[#4fd8fd] text-[7px] font-extrabold px-1.5 py-0.5 rounded mt-1 uppercase">ADJUDICADA</span>
        </div>
      `;
      row.querySelector(`#link-admin-p-${p.id}`).addEventListener("click", () => { selectedProduct = p; navigateToScreen("detail"); });
      closedContain.appendChild(row);
    });
  }

  if (window.lucide) window.lucide.createIcons();
}

// ==========================================
//          BACKGROUND SERVICES
// ==========================================
function startBackgroundServices() {
  setInterval(() => {
    obtenerProductosModificados();
    tickCountdownClocks();
    tickDetailsCountdown();
  }, 1000);

  // Competitor Simulated Bids Ticker loop (every 30s)
  setInterval(() => {
    if (!loggedUser) return;
    const list = obtenerProductosModificados();
    const activas = list.filter(p => p.estado === "activa");
    if (activas.length === 0) return;

    const pickedP = activas[Math.floor(Math.random() * activas.length)];
    const bots = [
      { id: "usr_bot1", name: "CryptoWhale" },
      { id: "usr_bot2", name: "VoltMaster" },
      { id: "usr_bot3", name: "TeslaFan_09" },
      { id: "usr_bot4", name: "Cronos_Bidder" }
    ];
    const bot = bots[Math.floor(Math.random() * bots.length)];
    if (pickedP.liderActual === bot.id) return;

    const inc = Math.round(pickedP.ofertaActual * (0.02 + Math.random() * 0.03));
    const finalBid = pickedP.ofertaActual + Math.max(inc, 100);

    const ofertas = getLocalStorage("ofertas", []);
    ofertas.push({
      idOferta: `ofr_bot_${Date.now()}`,
      idProducto: pickedP.id,
      idUsuario: bot.id,
      usuarioNombre: bot.name,
      valor: finalBid,
      fecha: new Date().toISOString()
    });
    setLocalStorage("ofertas", ofertas);

    const prevLeader = pickedP.liderActual;
    pickedP.ofertaActual = finalBid;
    pickedP.liderActual = bot.id;
    pickedP.liderNombre = bot.name;

    const allP = getLocalStorage("productos", []);
    const idx = allP.findIndex(item => item.id === pickedP.id);
    if (idx !== -1) {
      allP[idx] = pickedP;
      setLocalStorage("productos", allP);
    }

    if (prevLeader === loggedUser.id) {
      agregarNotificacion(`¡Has sido superado! ${bot.name} ofertó $${finalBid.toLocaleString()} en "${pickedP.nombre}".`, "warning");
      showToast(`¡Has sido superado en "${pickedP.nombre}"!`, "warning");
    } else {
      agregarNotificacion(`Nueva puja de $${finalBid.toLocaleString()} por ${bot.name} en "${pickedP.nombre}".`, "info");
    }

    // Refresh current screens
    if (currentScreen === "browse") renderBrowseCatalog();
    else if (currentScreen === "detail" && selectedProduct && selectedProduct.id === pickedP.id) renderProductDetail();
    else if (currentScreen === "my-auctions") renderMyAuctionsView();
    else if (currentScreen === "admin") renderAdminOverview();

  }, 30000);
}

function tickCountdownClocks() {
  if (currentScreen !== "browse") return;
  document.querySelectorAll(".countdown-span").forEach(span => {
    const exp = span.getAttribute("data-expiry");
    if (!exp) return;
    const diff = new Date(exp).getTime() - Date.now();
    if (diff <= 0) {
      span.innerHTML = `<span class="text-red-400 font-bold uppercase text-[9px]">Finalizada</span>`;
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const dText = days > 0 ? `${days}d ` : "";
    span.innerText = `${dText}${String(hours).padStart(2, "0")}h:${String(mins).padStart(2, "0")}m:${String(secs).padStart(2, "0")}s`;
  });
}

function tickDetailsCountdown() {
  if (currentScreen !== "detail") return;
  const wrap = document.getElementById("countdown-wrapper-detail");
  if (!wrap) return;
  const exp = wrap.getAttribute("data-expiry");
  const diff = new Date(exp).getTime() - Date.now();
  if (diff <= 0) {
    renderProductDetail();
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById("detail-d").innerText = days;
  document.getElementById("detail-h").innerText = String(hours).padStart(2, "0");
  document.getElementById("detail-m").innerText = String(mins).padStart(2, "0");
  document.getElementById("detail-s").innerText = String(secs).padStart(2, "0");
}

// ==========================================
//          MODALS MANAGEMENT
// ==========================================
function openQuickBidModal(product) {
  quickBidSelectedProduct = product;
  document.getElementById("quick-bid-prod-name").innerText = product.nombre;
  
  const minNeeded = Math.max(product.ofertaActual, product.precioInicial) + 1;
  document.getElementById("quick-bid-min-label").innerText = `Monto mínimo sugerido ($${minNeeded.toLocaleString()})`;
  document.getElementById("quick-bid-amount").value = minNeeded;
  document.getElementById("quick-bid-amount").min = minNeeded;
  document.getElementById("quick-bid-current-price").innerText = `$${product.ofertaActual.toLocaleString()}`;
  document.getElementById("quick-bid-current-leader").innerText = product.liderNombre || "Por asignar";
  
  document.getElementById("quick-bid-error").classList.add("hidden");
  document.getElementById("quick-bid-modal").classList.remove("hidden");
}

function closeQuickBidModal() {
  document.getElementById("quick-bid-modal").classList.add("hidden");
  quickBidSelectedProduct = null;
}

function openPublishModal() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const offset = tomorrow.getTimezoneOffset();
  const adjusted = new Date(tomorrow.getTime() - offset * 60 * 1000);
  document.getElementById("pub-closing-date").value = adjusted.toISOString().slice(0, 16);
  
  document.getElementById("publish-modal-error").classList.add("hidden");
  document.getElementById("publish-modal-form").reset();
  document.getElementById("publish-modal").classList.remove("hidden");
}

function closePublishModal() {
  document.getElementById("publish-modal").classList.add("hidden");
}

function updateUnreadNotifications() {
  const list = obtenerNotificaciones();
  document.getElementById("bell-badge-count").innerText = list.length;
  const listCon = document.getElementById("notifications-list");
  listCon.innerHTML = "";
  if (list.length === 0) {
    listCon.innerHTML = `<p class="text-center py-4 text-xs text-on-surface-variant">Bandeja limpia de novedades.</p>`;
    return;
  }
  list.forEach(item => {
    let borderType = "border-[#cfbdff]";
    if (item.tipo === "success") borderType = "border-green-400";
    else if (item.tipo === "warning") borderType = "border-yellow-500";
    
    const div = document.createElement("div");
    div.className = `p-2.5 bg-[#0b0f10]/80 border-l-2 ${borderType} rounded hover:bg-[#191c1e] text-[11px] mb-2 leading-relaxed`;
    div.innerHTML = `<p class="text-white font-medium">${item.mensaje}</p><span class="block text-[8px] text-[#abb9d6] font-mono mt-1">${new Date(item.fecha).toLocaleTimeString()}</span>`;
    listCon.appendChild(div);
  });
}

// ==========================================
//          DYNAMIC TOAST INJECTOR
// ==========================================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "pointer-events-auto bg-[#191c1e]/95 border border-outline-variant/60 rounded-xl p-4 shadow-2xl backdrop-blur-md flex gap-3 h-18 text-xs max-w-sm w-full translate-x-10 opacity-0 transition-all duration-300 relative overflow-hidden mb-2";
  
  let col = "bg-[#cfbdff]";
  let icon = "info";
  if (type === "success") { col = "bg-green-400"; icon = "check-circle"; }
  else if (type === "warning") { col = "bg-yellow-500"; icon = "bell"; }
  else if (type === "error") { col = "bg-red-500"; icon = "shield-alert"; }

  toast.innerHTML = `
    <div class="absolute left-0 top-0 bottom-0 w-1.5 ${col}"></div>
    <div class="flex-shrink-0 text-white pt-0.5"><i data-lucide="${icon}" class="w-4 h-4 text-tertiary-base"></i></div>
    <div class="flex-grow pr-4">
      <p class="text-white font-bold text-[10px] uppercase tracking-wider">Aviso de Precisión</p>
      <p class="text-[#abb9d6] text-[11px] mt-1 leading-snug line-clamp-2">${message}</p>
    </div>
    <button class="absolute top-3 right-3 text-on-surface-variant hover:text-white cursor-pointer" onclick="this.parentElement.remove()"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
  `;
  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => toast.classList.remove("translate-x-10", "opacity-0"), 40);
  setTimeout(() => {
    toast.classList.add("translate-x-10", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}
window.showToast = showToast;

// ==========================================
//          EVENT BINDINGS
// ==========================================
function setupCoreEventListeners() {
  document.getElementById("demo-alejandro").addEventListener("click", () => {
    document.getElementById("login-email").value = "alejandro@ejemplo.com";
    document.getElementById("login-password").value = "password123";
    submitLoginForm();
  });
  document.getElementById("demo-ana").addEventListener("click", () => {
    document.getElementById("login-email").value = "ana@ejemplo.com";
    document.getElementById("login-password").value = "password123";
    submitLoginForm();
  });

  document.getElementById("nav-btn-browse").addEventListener("click", () => navigateToScreen("browse"));
  document.getElementById("nav-btn-my-auctions").addEventListener("click", () => navigateToScreen("my-auctions"));
  document.getElementById("nav-btn-admin").addEventListener("click", () => navigateToScreen("admin"));
  document.getElementById("logo-nav-home").addEventListener("click", () => navigateToScreen("browse"));

  document.getElementById("mob-nav-browse").addEventListener("click", () => navigateToScreen("browse"));
  document.getElementById("mob-nav-my-auctions").addEventListener("click", () => navigateToScreen("my-auctions"));
  document.getElementById("mob-nav-admin").addEventListener("click", () => navigateToScreen("admin"));

  document.getElementById("floating-publish-fab").addEventListener("click", openPublishModal);
  document.getElementById("publish-modal-close").addEventListener("click", closePublishModal);
  document.getElementById("pub-cancel-btn").addEventListener("click", closePublishModal);
  
  document.getElementById("quick-bid-close").addEventListener("click", closeQuickBidModal);
  document.getElementById("quick-bid-cancel").addEventListener("click", closeQuickBidModal);

  document.getElementById("pub-image-fill-demo").addEventListener("click", () => {
    const item = PREMIUM_STOCK_ITEMS[Math.floor(Math.random() * PREMIUM_STOCK_ITEMS.length)];
    document.getElementById("pub-name").value = item.nombre;
    document.getElementById("pub-category").value = item.categoria;
    document.getElementById("pub-image").value = item.imagen;
    document.getElementById("pub-description").value = item.descripcion;
    document.getElementById("pub-starting-price").value = Math.floor(Math.random() * 8000) + 1500;
    showToast("Formulario autocompletado con lote de stock.", "success");
  });

  document.getElementById("header-logout-btn").addEventListener("click", () => {
    cerrarSesion();
    loggedUser = null;
    showToast("Sesión cerrada correctamente.", "info");
    showAuthLayout();
  });

  document.getElementById("bell-dropdown-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("notification-dropdown").classList.toggle("hidden");
    updateUnreadNotifications();
  });

  document.body.addEventListener("click", () => {
    document.getElementById("notification-dropdown").classList.add("hidden");
  });
  document.getElementById("notification-dropdown").addEventListener("click", e => e.stopPropagation());

  document.getElementById("clear-notifications").addEventListener("click", () => {
    limpiarNotificaciones();
    updateUnreadNotifications();
    showToast("Notificaciones removidas.", "success");
  });

  document.getElementById("go-to-register").addEventListener("click", () => showAuthView("register"));
  document.getElementById("go-to-login").addEventListener("click", () => showAuthView("login"));
  document.getElementById("forgot-password").addEventListener("click", () => alert("Tu contraseña por defecto es: password123"));

  document.getElementById("login-form").addEventListener("submit", (e) => { e.preventDefault(); submitLoginForm(); });

  document.getElementById("register-next-btn").addEventListener("click", () => {
    const m = document.getElementById("reg-email").value.trim();
    const p = document.getElementById("reg-password").value;
    const err = document.getElementById("register-error");
    err.classList.add("hidden");

    if (!m || !p) { err.classList.remove("hidden"); err.innerText = "Por favor completa el Paso 1."; return; }
    if (!m.includes("@")) { err.classList.remove("hidden"); err.innerText = "Correo inválido."; return; }
    if (p.length < 8) { err.classList.remove("hidden"); err.innerText = "La contraseña debe tener mínimo 8 caracteres."; return; }

    document.getElementById("reg-step-1").classList.add("hidden");
    document.getElementById("reg-step-2").classList.remove("hidden");
    document.getElementById("register-step-title").innerText = "Paso 2 de 2: Perfil Fiscal / Mercantil";
    document.getElementById("register-progress-bar").style.width = "100%";
  });

  document.getElementById("register-back-btn").addEventListener("click", () => {
    document.getElementById("reg-step-1").classList.remove("hidden");
    document.getElementById("reg-step-2").classList.add("hidden");
    document.getElementById("register-step-title").innerText = "Paso 1 de 2: Credenciales de cuenta";
    document.getElementById("register-progress-bar").style.width = "50%";
  });

  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const m = document.getElementById("reg-email").value.trim();
    const p = document.getElementById("reg-password").value;
    const f = document.getElementById("reg-firstname").value.trim();
    const l = document.getElementById("reg-lastname").value.trim();
    const c = document.getElementById("reg-category").value;
    const acc = document.getElementById("reg-terms").checked;
    
    const err = document.getElementById("register-error");
    err.classList.add("hidden");

    if (!f || !l) { err.classList.remove("hidden"); err.innerText = "Escribe tu nombre y apellido."; return; }
    if (!acc) { err.classList.remove("hidden"); err.innerText = "Debes aceptar los Términos de Servicio."; return; }

    const r = registrarUsuario({ nombre: f, apellido: l, email: m, password: p, categoriaInteres: c });
    if (r.success) {
      showToast(r.message, "success");
      iniciarSesion(m, p);
      loggedUser = r.user;
      showAppLayout();
    } else {
      err.classList.remove("hidden");
      err.innerText = r.message;
    }
  });

  document.getElementById("catalog-search").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderBrowseCatalog();
  });

  document.getElementById("catalog-order-by").addEventListener("change", (e) => {
    orderBy = e.target.value;
    renderBrowseCatalog();
  });

  document.getElementById("detail-back-btn").addEventListener("click", () => {
    selectedProduct = null;
    navigateToScreen("browse");
  });

  document.getElementById("quick-bid-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = document.getElementById("quick-bid-error");
    err.classList.add("hidden");
    const val = parseFloat(document.getElementById("quick-bid-amount").value);
    if (!val || isNaN(val)) { err.classList.remove("hidden"); err.innerText = "Ingresa un número."; return; }

    const res = realizarOferta(quickBidSelectedProduct.id, loggedUser.id, `${loggedUser.nombre} ${loggedUser.apellido}`, val);
    if (res.success) {
      showToast(res.message, "success");
      agregarNotificacion(`Licitaste $${val.toLocaleString()} en "${quickBidSelectedProduct.nombre}" (Acción Rápida).`, "success");
      closeQuickBidModal();
      if (currentScreen === "browse") renderBrowseCatalog();
      else if (currentScreen === "detail") renderProductDetail();
    } else {
      err.classList.remove("hidden");
      err.innerText = res.message;
    }
  });

  document.getElementById("publish-modal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = document.getElementById("publish-modal-error");
    err.classList.add("hidden");

    const n = document.getElementById("pub-name").value.trim();
    const cat = document.getElementById("pub-category").value;
    const price = parseFloat(document.getElementById("pub-starting-price").value);
    const dateStr = document.getElementById("pub-closing-date").value;
    const img = document.getElementById("pub-image").value.trim();
    const de = document.getElementById("pub-description").value.trim();

    if (!n || !price || !dateStr || !img || !de) { err.classList.remove("hidden"); err.innerText = "Completa todos los campos."; return; }
    if (price <= 0) { err.classList.remove("hidden"); err.innerText = "Coloca un precio inicial positivo."; return; }
    if (new Date(dateStr).getTime() <= Date.now()) { err.classList.remove("hidden"); err.innerText = "La fecha debe estar en el futuro."; return; }

    const res = publicarProducto({ nombre: n, categoria: cat, precioInicial: price, fechaCierre: new Date(dateStr).toISOString(), imagen: img, descripcion: de }, loggedUser.id, `${loggedUser.nombre} ${loggedUser.apellido}`);
    if (res.success) {
      showToast(res.message, "success");
      agregarNotificacion(`Has publicado un nuevo lote de subasta: "${n}".`, "success");
      closePublishModal();
      activeCategory = "Todas";
      searchQuery = "";
      navigateToScreen("browse");
    } else {
      err.classList.remove("hidden");
      err.innerText = res.message;
    }
  });

  document.getElementById("my-auctions-tab-bids").addEventListener("click", () => { activeSubTab = "bids"; renderMyAuctionsView(); });
  document.getElementById("my-auctions-tab-sales").addEventListener("click", () => { activeSubTab = "sales"; renderMyAuctionsView(); });
  document.getElementById("my-auctions-tab-refill").addEventListener("click", () => { activeSubTab = "transactions"; renderMyAuctionsView(); });

  document.getElementById("refill-funds-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const alertBox = document.getElementById("refill-success-alert");
    alertBox.classList.add("hidden");
    const val = parseFloat(document.getElementById("refill-amount").value);
    if (!val || isNaN(val) || val <= 0) { alert("Ingresa un monto positivo"); return; }

    const btn = document.getElementById("refill-submit-btn");
    btn.disabled = true;
    btn.innerText = "Verificando fondos...";

    setTimeout(() => {
      const bal = getLocalStorage(`balance_usr_${loggedUser.id}`, 25000);
      setLocalStorage(`balance_usr_${loggedUser.id}`, bal + val);
      btn.disabled = false;
      btn.innerText = "Ingresar Fondos Mercantiles";
      document.getElementById("refill-amount").value = "";
      alertBox.classList.remove("hidden");
      alertBox.innerText = `Se han acreditado $${val.toLocaleString()} con éxito en tu cartera mercantil!`;
      agregarNotificacion(`Aporte de $${val.toLocaleString()} de garantía acreditada con éxito.`, "success");
      renderMyAuctionsView();
    }, 1000);
  });
}

function submitLoginForm() {
  const m = document.getElementById("login-email").value.trim();
  const p = document.getElementById("login-password").value;
  const loginErr = document.getElementById("login-error");
  loginErr.classList.add("hidden");

  if (!m || !p) {
    loginErr.classList.remove("hidden");
    loginErr.innerText = "Por favor ingresa tu correo y contraseña.";
    return;
  }

  const btn = document.getElementById("login-submit-button");
  btn.disabled = true;
  btn.innerHTML = `<span>Validando credenciales...</span>`;

  setTimeout(() => {
    const res = iniciarSesion(m, p);
    btn.disabled = false;
    btn.innerHTML = `<span>Iniciar Sesión de Precisión</span>`;
    
    if (res.success && res.user) {
      loggedUser = res.user;
      showToast(res.message, "success");
      agregarNotificacion(`Inicio de sesión correcto de ${loggedUser.nombre}.`, "success");
      showAppLayout();
    } else {
      loginErr.classList.remove("hidden");
      loginErr.innerText = res.message;
    }
  }, 1000);
}

function resetRegisterForm() {
  document.getElementById("register-form").reset();
  document.getElementById("reg-step-1").classList.remove("hidden");
  document.getElementById("reg-step-2").classList.add("hidden");
  document.getElementById("register-step-title").innerText = "Paso 1 de 2: Credenciales de cuenta";
  document.getElementById("register-progress-bar").style.width = "50%";
}
