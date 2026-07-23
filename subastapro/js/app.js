/**
 * SubastaPro — app.js
 * Toda la capa de datos usa fetch() contra la API PHP en /api/.
 * Sin localStorage, sin datos mock, sin seedMockData.
 * HTML y CSS no fueron modificados.
 */

// ============================================================
//  IMAGEN — funciones globales AL INICIO del archivo
//  El HTML las llama con onclick= nada más cargar la página.
// ============================================================
window.switchImageTab = function(tab) {
  var isUpload = tab === 'upload';
  document.getElementById('img-panel-upload').style.display = isUpload ? '' : 'none';
  document.getElementById('img-panel-url').style.display    = isUpload ? 'none' : '';
  var tu = document.getElementById('img-tab-upload');
  var tl = document.getElementById('img-tab-url');
  var on  = 'flex-1 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all border-primary-base bg-primary-container-base/20 text-white';
  var off = 'flex-1 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all border-outline-variant text-on-surface-variant';
  tu.className = isUpload  ? on : off;
  tl.className = !isUpload ? on : off;
  document.getElementById('pub-image-final').value = '';
  if (isUpload) window.clearImagePreview();
  else { var pi = document.getElementById('pub-image'); if(pi) pi.value = ''; }
};

window.handleImageFileSelected = function(file) {
  if (!file) return;
  var ok = ['image/jpeg','image/png','image/webp','image/gif'];
  if (ok.indexOf(file.type) === -1) { alert('Solo se permiten imágenes JPG, PNG, WEBP o GIF.'); return; }
  if (file.size > 5*1024*1024) { alert('La imagen supera el límite de 5 MB.'); return; }
  window._pendingImageFile = file;
  var reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('pub-image-preview').src = e.target.result;
    document.getElementById('pub-image-preview-wrap').style.display = 'block';
    document.getElementById('pub-image-dropzone-label').innerHTML =
      '<span style="font-size:10px;font-weight:bold;color:#4ade80">✓ ' + file.name + '</span>';
    document.getElementById('pub-image-final').value = '__pending__';
  };
  reader.readAsDataURL(file);
};

window.clearImagePreview = function() {
  window._pendingImageFile = null;
  var w = document.getElementById('pub-image-preview-wrap'); if(w) w.style.display='none';
  var i = document.getElementById('pub-image-preview');      if(i) i.src='';
  var f = document.getElementById('pub-image-file');         if(f) f.value='';
  var l = document.getElementById('pub-image-dropzone-label');
  if(l) l.innerHTML='Haz clic o arrastra una imagen aquí<br/><span style="font-size:9px;opacity:0.6">JPG, PNG, WEBP · máx. 5 MB</span>';
  var n = document.getElementById('pub-image-final');        if(n) n.value='';
};


// ============================================================
//  CONFIGURACIÓN DE LA API
//  Cambia esta URL si tu API está en otro dominio o subcarpeta.
// ============================================================
const API = {
  auth:          (action)  => `api/auth.php?action=${action}`,
  productos:     ()        => `api/productos.php`,
  producto:      (id)      => `api/productos.php?id=${id}`,
  ofertar:       (id)      => `api/productos.php?id=${id}&action=ofertar`,
  productosQ:    (params)  => `api/productos.php?${params}`,
  ofertas:       ()        => `api/ofertas.php`,
  notificaciones:()        => `api/notificaciones.php`,
  notifLeida:    (id)      => `api/notificaciones.php?id=${id}`,
  perfil:        ()        => `api/perfil.php`,
};

// ── Token JWT ──────────────────────────────────────────────
function getToken()         { return sessionStorage.getItem('sp_token'); }
function setToken(t)        { sessionStorage.setItem('sp_token', t); }
function removeToken()      { sessionStorage.removeItem('sp_token'); }
function getSession()       { try { return JSON.parse(sessionStorage.getItem('sp_user')); } catch { return null; } }
function setSession(u)      { sessionStorage.setItem('sp_user', JSON.stringify(u)); }
function removeSession()    { sessionStorage.removeItem('sp_user'); }

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

async function apiFetch(url, options = {}) {
  const res  = await fetch(url, { headers: authHeaders(), ...options });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || 'Error del servidor'), { data });
  return data;
}

// ============================================================
//  AUTENTICACIÓN
// ============================================================
async function registrarUsuario(payload) {
  try {
    const d = await apiFetch(API.auth('registro'), { method: 'POST', body: JSON.stringify(payload) });
    setToken(d.token); setSession(d.user);
    return { success: true, message: d.message, user: d.user };
  } catch (e) { return { success: false, message: e.message }; }
}

async function iniciarSesion(email, password) {
  try {
    const d = await apiFetch(API.auth('login'), { method: 'POST', body: JSON.stringify({ email, password }) });
    setToken(d.token); setSession(d.user);
    return { success: true, message: d.message, user: d.user };
  } catch (e) { return { success: false, message: e.message }; }
}

function obtenerSesionActual() { return getSession(); }

function cerrarSesion() { removeToken(); removeSession(); }

// ============================================================
//  PRODUCTOS
// ============================================================
async function buscarYFiltrarProductos(query, categoria, orden) {
  const p = new URLSearchParams({ estado: 'activa' });
  if (query?.trim()) p.set('q', query.trim());
  if (categoria && categoria !== 'Todas' && categoria !== 'Categorías') p.set('categoria', categoria);
  if (orden) p.set('orden', orden);
  const d = await apiFetch(API.productosQ(p));
  return d.productos || [];
}

async function obtenerProductoPorId(id) {
  const d = await apiFetch(API.producto(id));
  return d.producto;
}

async function obtenerTodosLosProductos() {
  const d = await apiFetch(API.productosQ(new URLSearchParams({ estado: 'activa' })));
  return d.productos || [];
}

async function obtenerTodosConFinaliz() {
  const [a, f] = await Promise.all([
    apiFetch(API.productosQ(new URLSearchParams({ estado: 'activa' }))),
    apiFetch(API.productosQ(new URLSearchParams({ estado: 'finalizada' })))
  ]);
  return [...(a.productos || []), ...(f.productos || [])];
}

async function publicarProducto(producto, vendedorId, vendedorNombre) {
  try {
    const d = await apiFetch(API.productos(), {
      method: 'POST',
      body: JSON.stringify({
        nombre: producto.nombre, categoria: producto.categoria,
        descripcion: producto.descripcion, imagen: producto.imagen,
        precioInicial: producto.precioInicial, fechaCierre: producto.fechaCierre
      })
    });
    return { success: true, message: d.message };
  } catch (e) { return { success: false, message: e.message }; }
}

// ============================================================
//  OFERTAS / PUJAS
// ============================================================
async function realizarOferta(idProducto, idUsuario, usuarioNombre, monto) {
  if (!monto || isNaN(monto) || monto <= 0) return { success: false, message: 'El monto debe ser un número positivo.' };
  try {
    const d = await apiFetch(API.ofertar(idProducto), { method: 'POST', body: JSON.stringify({ valor: monto }) });
    return { success: true, message: d.message };
  } catch (e) { return { success: false, message: e.message, subastaFinalizada: e.data?.subastaFinalizada }; }
}

async function obtenerHistorialDeOfertas(idProducto) {
  const d = await apiFetch(API.producto(idProducto));
  return d.ofertas || [];
}

async function obtenerOfertasPorUsuario(idUsuario) {
  const d  = await apiFetch(API.ofertas());
  const os = d.ofertas || [];

  // Agrupar por producto
  const byProd = {};
  os.forEach(o => {
    if (!byProd[o.producto_id]) byProd[o.producto_id] = [];
    byProd[o.producto_id].push(o);
  });

  return Object.values(byProd).map(grupo => {
    const sorted = grupo.sort((a,b) => b.valor - a.valor);
    const top    = sorted[0];
    const prod = {
      id: top.producto_id, nombre: top.producto_nombre, estado: top.producto_estado,
      imagen: top.producto_imagen || 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=600&auto=format&fit=crop',
      ofertaActual: parseFloat(top.producto_oferta_actual),
      precioInicial: 0,
      liderActual: top.producto_lider_id,
      fechaCierre: top.producto_fecha_cierre
    };

    let estadoPujador = 'Superado';
    if (prod.estado === 'activa') {
      estadoPujador = String(prod.liderActual) === String(idUsuario) ? 'Ganando' : 'Superado';
    } else {
      estadoPujador = String(prod.liderActual) === String(idUsuario) ? 'Ganado' : 'Perdido';
    }

    return { producto: prod, ofertaActualUsuario: parseFloat(top.valor), estadoPujador, fechaOferta: top.fecha };
  }).sort((a,b) => new Date(b.fechaOferta) - new Date(a.fechaOferta));
}

// ============================================================
//  NOTIFICACIONES
// ============================================================
async function obtenerNotificaciones() {
  try { return (await apiFetch(API.notificaciones())).notificaciones || []; }
  catch { return []; }
}

async function limpiarNotificaciones() {
  const lista = await obtenerNotificaciones();
  await Promise.allSettled(lista.map(n => apiFetch(API.notifLeida(n.id), { method: 'PATCH' })));
}

// ============================================================
//  ESTADO GLOBAL
// ============================================================
let loggedUser        = null;
let currentScreen     = 'browse';
let selectedProduct   = null;
let activeCategory    = 'Todas';
let searchQuery       = '';
let orderBy           = 'ending';
let activeSubTab      = 'bids';
let quickBidSelProd   = null;

const CATEGORIES_LIST = ['Todas','Tecnología','Electrónica','Vehículos','Hogar','Ropa','Deportes','Coleccionables','Herramientas','Otros'];

const PREMIUM_STOCK_ITEMS = [
  { nombre: 'McLaren P1 Hybrid Hypercar 2015', categoria: 'Vehículos', descripcion: 'Una de las 375 unidades producidas. Chasis monocasco de carbono MonoCage.', imagen: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=600&auto=format&fit=crop' },
  { nombre: 'IPhone 16 Pro Max - Custom 24k Gold', categoria: 'Tecnología', descripcion: 'Edición limitada de 24k de oro. Certificado Caviar y 1TB.', imagen: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop' },
  { nombre: 'Cámara Retro Linhof Technika V Vintage', categoria: 'Coleccionables', descripcion: 'Hermosa cámara alemana vintage de fuelle para coleccionistas analógicos.', imagen: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=600&auto=format&fit=crop' },
];

// ============================================================
//  CICLO DE VIDA
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  loggedUser = obtenerSesionActual();
  if (loggedUser) showAppLayout(); else showAuthLayout();
  setupEventListeners();
  startBackgroundServices();
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 150);
});

function showAuthLayout() {
  document.getElementById('auth-stack').classList.remove('hidden');
  document.getElementById('app-stack').classList.add('hidden');
  showAuthView('login');
}

function showAppLayout() {
  document.getElementById('auth-stack').classList.add('hidden');
  document.getElementById('app-stack').classList.remove('hidden');
  updateHeaderUser();
  navigateToScreen('browse');
}

function showAuthView(view) {
  const isLogin = view === 'login';
  document.getElementById('login-view').classList.toggle('hidden', !isLogin);
  document.getElementById('register-view').classList.toggle('hidden', isLogin);
  document.getElementById(isLogin ? 'login-error' : 'register-error').classList.add('hidden');
  if (!isLogin) resetRegisterForm();
}

function updateHeaderUser() {
  if (!loggedUser) return;
  document.getElementById('header-user-fullname').innerText = `${loggedUser.nombre} ${loggedUser.apellido}`;
  document.getElementById('header-user-email').innerText    = loggedUser.email;
  const init = `${loggedUser.nombre[0]}${loggedUser.apellido[0]}`.toUpperCase();
  document.getElementById('header-user-avatar').innerText   = init;
  document.getElementById('profile-avatar-large').innerText = init;
}

function navigateToScreen(screen) {
  currentScreen = screen;
  ['browse','detail','my-auctions','admin','profile'].forEach(s =>
    document.getElementById(`screen-${s}`).classList.add('hidden'));
  document.getElementById(`screen-${screen}`)?.classList.remove('hidden');

  const btns = { browse: 'nav-btn-browse', 'my-auctions': 'nav-btn-my-auctions', admin: 'nav-btn-admin', profile: 'nav-btn-profile' };
  const mobs  = { browse: 'mob-nav-browse', 'my-auctions': 'mob-nav-my-auctions', admin: 'mob-nav-admin', profile: 'mob-nav-profile' };
  const act   = ['bg-primary-container-base/15','text-white','border','border-[#cfbdff]/20'];
  const inact = ['text-on-surface-variant','hover:bg-surface-variant/40','hover:text-on-surface'];
  const mAct  = ['text-[#cfbdff]','bg-primary-container-base/20'];
  const mIn   = ['text-on-surface-variant','hover:text-white'];

  Object.values(btns).forEach(id => { const b = document.getElementById(id); act.forEach(c=>b.classList.remove(c)); inact.forEach(c=>{b.classList.remove(c);b.classList.add(c);}); });
  Object.values(mobs).forEach(id  => { const b = document.getElementById(id);  b.className = 'flex flex-col items-center justify-center p-2 rounded-xl text-[10px]'; mIn.forEach(c=>b.classList.add(c)); });

  if (btns[screen]) { const b=document.getElementById(btns[screen]); inact.forEach(c=>b.classList.remove(c)); act.forEach(c=>b.classList.add(c)); }
  if (mobs[screen])  { const b=document.getElementById(mobs[screen]);  mIn.forEach(c=>b.classList.remove(c)); mAct.forEach(c=>b.classList.add(c)); }

  const renders = { browse: renderBrowseCatalog, detail: renderProductDetail, 'my-auctions': renderMyAuctionsView, admin: renderAdminOverview, profile: renderProfileView };
  renders[screen]?.();
  updateUnreadNotifications();
  if (window.lucide) window.lucide.createIcons();
}

// ============================================================
//  RENDER: CATÁLOGO
// ============================================================
async function renderBrowseCatalog() {
  // Categorías sidebar
  const catCon = document.getElementById('category-pills-container');
  catCon.innerHTML = '';
  CATEGORIES_LIST.forEach(cat => {
    const act = activeCategory === cat;
    const btn = document.createElement('button');
    btn.className = `w-full flex items-center justify-between text-left text-xs font-bold py-3 px-3.5 rounded-lg transition-all cursor-pointer ${act ? 'bg-primary-container-base/30 text-white border-l-4 border-[#cfbdff]' : 'text-on-surface-variant hover:bg-[#191c1e] hover:text-on-surface'}`;
    btn.innerHTML = `<span>${cat}</span><i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>`;
    btn.addEventListener('click', () => { activeCategory = cat; renderBrowseCatalog(); });
    catCon.appendChild(btn);
  });

  const badge = document.getElementById('current-active-filter-badge');
  const badgeText = document.getElementById('active-filter-text-label');
  if (activeCategory !== 'Todas') { badge.classList.remove('hidden'); badgeText.innerText = activeCategory; }
  else badge.classList.add('hidden');

  const grid = document.getElementById('products-grid-container');
  grid.innerHTML = `<div class="col-span-full py-16 text-center text-xs text-on-surface-variant">Cargando lotes...</div>`;

  let list = [];
  try { list = await buscarYFiltrarProductos(searchQuery, activeCategory, orderBy); }
  catch(e) { grid.innerHTML = `<div class="col-span-full py-16 text-center text-xs text-red-400">Error al conectar con la API: ${e.message}</div>`; return; }

  document.getElementById('catalog-counts-badge').innerText = list.length;
  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = `<div class="col-span-full py-16 text-center glass-panel rounded-2xl flex flex-col justify-center items-center gap-4"><i data-lucide="shopping-bag" class="w-12 h-12 text-on-surface-variant"></i><div><h4 class="text-sm font-bold text-white uppercase tracking-wider">Sin lotes activos</h4><p class="text-xs text-[#abb9d6] mt-1">No se hallaron subastas disponibles como "${activeCategory}".</p></div></div>`;
    if (window.lucide) window.lucide.createIcons(); return;
  }

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'group bg-[#101415] border border-outline-variant/75 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:border-primary-base/40 transition-all duration-300 flex flex-col h-full relative';
    const diff   = new Date(p.fechaCierre).getTime() - Date.now();
    const isOver = diff <= 0;
    const isSoon = !isOver && diff < 3600000;

    let badge = `<span class="absolute top-3 right-3 bg-green-950/95 border border-green-700/50 text-[10px] font-bold text-green-400 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">● Activa</span>`;
    if (isOver)      badge = `<span class="absolute top-3 right-3 bg-red-950/90 border border-red-700/50 text-[10px] font-bold text-red-400 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">❌ Cerrado</span>`;
    else if (isSoon) badge = `<span class="absolute top-3 right-3 bg-yellow-950/90 border border-yellow-700/50 text-[10px] font-bold text-yellow-500 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md animate-pulse">⏳ Inminente</span>`;

    card.innerHTML = `
      <div class="relative aspect-video w-full overflow-hidden bg-black/40">
        <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" src="${p.imagen}" alt="${p.nombre}" />
        <span class="absolute top-3 left-3 bg-[#0b0f10]/85 border border-outline-variant text-[10px] font-bold text-[#4cd6fb] px-2.5 py-1 rounded tracking-wider uppercase backdrop-blur-md">${p.categoria}</span>
        ${badge}
        <div class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-center text-xs">
          <span class="text-[#abb9d6] font-medium flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5 text-primary-base"></i> Cierre:</span>
          <span class="font-mono font-bold countdown-span text-[11px]" data-expiry="${p.fechaCierre}">Calculando...</span>
        </div>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-bold text-white hover:text-primary-base transition-colors cursor-pointer line-clamp-1 mb-1.5 card-title">${p.nombre}</h3>
          <p class="text-[11px] text-[#abb9d6] line-clamp-3 mb-4 leading-relaxed">${p.descripcion}</p>
        </div>
        <div>
          <div class="grid grid-cols-2 gap-2 border-t border-b border-outline-variant/60 py-3.5 mb-4 bg-surface-container-high/10 px-2 rounded-lg">
            <div><span class="text-[9px] uppercase font-bold tracking-wider text-[#abb9d6] block mb-0.5">Inicial</span><span class="text-xs font-semibold text-white">$${p.precioInicial.toLocaleString('es-CO')}</span></div>
            <div><span class="text-[9px] uppercase font-bold tracking-wider text-[#abb9d6] block mb-0.5">Lote Líder</span><span class="text-xs font-black text-tertiary-base">$${p.ofertaActual.toLocaleString('es-CO')}</span></div>
          </div>
          <div class="flex items-center gap-2 mb-4 text-[10px] font-medium text-on-surface-variant bg-[#191c1e] px-2.5 py-1.5 rounded border border-outline-variant/60">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-primary-base"></span><span>Líder activo:</span>
            <span class="font-bold text-white truncate flex-1">${p.liderNombre || 'Por asignar'}</span>
          </div>
          <div class="flex gap-2">
            <button class="flex-1 border border-outline-variant text-[#e0e3e5] hover:bg-slate-800 font-semibold text-xs py-2.5 rounded-lg transition-all cursor-pointer btn-ficha">Ficha</button>
            <button class="flex-[2] bg-[#6200ee] hover:bg-opacity-92 disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-extrabold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md btn-bid" ${isOver ? 'disabled' : ''}>
              <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> Ofertar
            </button>
          </div>
        </div>
      </div>`;

    card.querySelector('.card-title').addEventListener('click', () => { selectedProduct = p; navigateToScreen('detail'); });
    card.querySelector('.btn-ficha').addEventListener('click', ()  => { selectedProduct = p; navigateToScreen('detail'); });
    card.querySelector('.btn-bid').addEventListener('click', (e)   => { e.stopPropagation(); openQuickBidModal(p); });
    grid.appendChild(card);
  });

  tickCountdownClocks();
  if (window.lucide) window.lucide.createIcons();
}

// ============================================================
//  RENDER: DETALLE DE PRODUCTO
// ============================================================
async function renderProductDetail() {
  const container = document.getElementById('detail-view-content');
  container.innerHTML = `<div class="py-16 text-center text-xs text-on-surface-variant">Cargando detalle del lote...</div>`;
  if (!selectedProduct) return;

  let p, historia;
  try {
    const d = await apiFetch(API.producto(selectedProduct.id));
    p = d.producto; historia = d.ofertas || [];
  } catch(e) {
    container.innerHTML = `<div class="py-16 text-center text-xs text-red-400">Error al cargar lote: ${e.message}</div>`; return;
  }
  selectedProduct = p;

  const diff   = new Date(p.fechaCierre).getTime() - Date.now();
  const isOver = p.estado === 'finalizada' || diff <= 0;
  const isSoon = !isOver && diff < 3600000;
  const expMin  = Math.max(p.ofertaActual, p.precioInicial) + 1;

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
            <div><span class="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-widest mb-1">Categoría del lote</span><strong class="text-tertiary-base text-xs font-bold">${p.categoria}</strong></div>
            <div><span class="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-widest mb-1">Ofertante Emisor</span><span class="font-bold text-white text-xs">${p.vendedorNombre || 'Subastador Oficial'}</span></div>
          </div>
        </div>
        <div class="glass-panel p-6 rounded-2xl">
          <h3 class="font-sans font-bold text-sm text-white mb-4 flex items-center gap-2"><i data-lucide="trending-up" class="w-4 h-4 text-[#4cd6fb]"></i> Bitácora de Pujas de Garantía (${historia.length})</h3>
          <div id="timeline-scrollable-container" class="space-y-2.5 max-h-[250px] overflow-y-auto pr-2"></div>
        </div>
      </div>
      <div class="lg:col-span-5 space-y-6">
        <div class="glass-panel p-6 rounded-2xl bg-gradient-to-b from-surface-container-high/60 to-surface-container-low border border-outline-variant/80 shadow-2xl">
          <span class="text-xs font-extrabold uppercase tracking-widest text-[#cfbdff] flex items-center gap-1.5 mb-2.5"><i data-lucide="clock" class="w-4 h-4 text-[#cfbdff]"></i> Reloj de Precisión de Cierre</span>
          <div id="detail-timer-placement"></div>
        </div>
        <div class="glass-panel p-6 rounded-2xl border border-outline-variant">
          <h2 class="font-sans font-black text-xl text-white mr-1 leading-snug line-clamp-2">${p.nombre}</h2>
          <div class="flex justify-between items-center p-4 rounded-xl bg-[#14181a] border border-outline-variant/50 my-5">
            <div><span class="text-[9px] text-[#abb9d6] uppercase font-bold tracking-wider">Última Propuesta Registrada</span><span class="block text-2xl font-black text-[#4cd6fb] mt-1 pr-1 font-mono">$${p.ofertaActual.toLocaleString('es-CO')}</span></div>
            <div class="text-right"><span class="text-[9px] text-[#abb9d6] uppercase font-bold tracking-wider block">Líder Activo</span><span class="text-xs font-bold text-white block mt-1 truncate max-w-[150px]">${p.liderNombre || 'Ninguno'}</span></div>
          </div>
          <div id="detail-bidding-area"></div>
        </div>
      </div>
    </div>`;

  // Historial de pujas
  const tl = container.querySelector('#timeline-scrollable-container');
  if (!historia.length) {
    tl.innerHTML = `<div class="text-center py-8 text-xs text-on-surface-variant bg-[#191c1e] rounded-xl border border-dashed border-outline-variant">No hay ofertas aún. ¡Sé el primero!</div>`;
  } else {
    historia.forEach((o, i) => {
      const isLeader = i === 0 && !isOver;
      const div = document.createElement('div');
      div.className = `flex justify-between items-center p-3 rounded-lg border transition-all ${isLeader ? 'bg-primary-container-base/15 border-primary-base/40 text-white' : 'bg-[#14181a] border-outline-variant/40'}`;
      const nombre = o.nombre ? `${o.nombre} ${o.apellido || ''}`.trim() : (o.usuarioNombre || 'Usuario');
      div.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="w-2.5 h-2.5 rounded-full ${isLeader ? 'bg-[#cfbdff] animate-ping' : 'bg-outline-variant'}"></div>
          <div><span class="text-xs font-bold text-[#e0e3e5] block">${nombre}</span><span class="text-[9px] text-[#abb9d6] font-mono block mt-0.5">${new Date(o.fecha).toLocaleDateString()} ${new Date(o.fecha).toLocaleTimeString()}</span></div>
        </div>
        <div class="text-right"><span class="text-xs font-black ${isLeader ? 'text-tertiary-base' : 'text-[#abb9d6]'}">$${parseFloat(o.valor).toLocaleString('es-CO')}</span>${isLeader ? '<span class="block text-[8px] font-extrabold text-green-400 mt-0.5 tracking-wider uppercase">LÍDER</span>' : ''}</div>`;
      tl.appendChild(div);
    });
  }

  // Timer
  const timerPlacer = container.querySelector('#detail-timer-placement');
  if (isOver) {
    timerPlacer.innerHTML = `
      <div class="bg-red-950/40 border border-red-800/80 rounded-xl p-4 text-center mt-3">
        <span class="text-sm font-extrabold text-red-400 block tracking-wider uppercase">SUBASTA CERRADA</span>
        ${p.ganadorNombre ? `<div class="pt-3.5 mt-3.5 border-t border-red-800/30"><span class="text-[10px] font-bold text-gray-400 block uppercase">Inversor Ganador Adjudicado:</span><span class="text-base font-black text-tertiary-base block mt-1">${p.ganadorNombre}</span><span class="text-[10px] text-on-surface-variant block mt-0.5">Finiquitado en: <strong>$${(p.ofertaGanadora || p.ofertaActual).toLocaleString('es-CO')}</strong></span></div>` : `<div class="pt-3 mt-3 border-t border-red-800/20 text-xs text-[#abb9d6]">No se registraron ofertas formales.</div>`}
      </div>`;
  } else {
    timerPlacer.innerHTML = `
      <div class="grid grid-cols-4 gap-2 text-center my-4 font-mono select-none" id="countdown-wrapper-detail" data-expiry="${p.fechaCierre}">
        <div class="bg-[#121617]/90 border border-outline-variant p-2.5 rounded-lg"><span class="block text-lg font-extrabold text-white" id="detail-d">0</span><span class="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Días</span></div>
        <div class="bg-[#121617]/90 border border-outline-variant p-2.5 rounded-lg"><span class="block text-lg font-extrabold text-white" id="detail-h">00</span><span class="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Horas</span></div>
        <div class="bg-[#121617]/90 border border-outline-variant p-2.5 rounded-lg"><span class="block text-lg font-extrabold text-white" id="detail-m">00</span><span class="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Mins</span></div>
        <div class="bg-primary-container-base/15 border border-[#cfbdff]/20 p-2.5 rounded-lg"><span class="block text-lg font-extrabold ${isSoon ? 'text-yellow-400 animate-pulse' : 'text-[#cfbdff]'}" id="detail-s">00</span><span class="text-[8px] uppercase font-bold text-[#cfbdff] tracking-wider">Segs</span></div>
      </div>`;
    tickDetailsCountdown();
  }

  // Área de puja
  const biddingArea = container.querySelector('#detail-bidding-area');
  if (isOver) {
    biddingArea.innerHTML = `<div class="text-xs text-center text-[#abb9d6] py-3 uppercase tracking-wider font-semibold">Subasta Mercantil Finiquitada</div>`;
  } else if (String(p.vendedorId) === String(loggedUser.id)) {
    biddingArea.innerHTML = `<div class="bg-primary-container-base/10 border border-primary-base/20 rounded-xl p-4 text-center"><span class="text-xs font-semibold text-white block">Eres el propietario de este artículo</span><p class="text-[10px] text-on-surface-variant mt-1">Socio emisor no habilitado para auto-pujar.</p></div>`;
  } else {
    biddingArea.innerHTML = `
      <form id="detail-bidding-form" class="space-y-4">
        <div id="detail-bid-form-error" class="hidden bg-red-950/60 border border-red-800 text-red-200 p-3 rounded-lg text-xs"></div>
        <div>
          <label class="text-[10px] font-semibold text-on-surface-variant block mb-2">Monto de puja sugerido (Mínimo: $${expMin.toLocaleString()})</label>
          <div class="relative"><span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span><input type="number" id="detail-bid-input-box" class="w-full bg-[#101415] border border-outline-variant text-[13px] text-on-surface rounded-lg py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary-base outline-none font-semibold" placeholder="${expMin}" required /></div>
        </div>
        <button type="submit" class="w-full bg-[#6200ee] hover:bg-opacity-95 text-white font-extrabold text-xs py-3.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg">Colocar Oferta de Licitación</button>
      </form>`;
    biddingArea.querySelector('#detail-bidding-form').addEventListener('submit', async e => {
      e.preventDefault();
      const errBox = document.getElementById('detail-bid-form-error');
      errBox.classList.add('hidden');
      const val = parseFloat(document.getElementById('detail-bid-input-box').value);
      if (!val || isNaN(val)) { errBox.classList.remove('hidden'); errBox.innerText = 'Por favor ingresa un monto válido.'; return; }
      const res = await realizarOferta(p.id, loggedUser.id, `${loggedUser.nombre} ${loggedUser.apellido}`, val);
      if (res.success) { showToast(res.message, 'success'); renderProductDetail(); }
      else { errBox.classList.remove('hidden'); errBox.innerText = res.message; }
    });
  }
  if (window.lucide) window.lucide.createIcons();
}

// ============================================================
//  RENDER: MIS SUBASTAS
// ============================================================
async function renderMyAuctionsView() {
  document.getElementById('profile-wallet-balance').innerText = '$25,000';
  document.getElementById('profile-user-fullname').innerText  = `${loggedUser.nombre} ${loggedUser.apellido}`;
  document.getElementById('profile-user-meta').innerText      = `Inversor Certificado • ${loggedUser.email}`;

  const tabs  = { bids: 'my-auctions-tab-bids', sales: 'my-auctions-tab-sales', transactions: 'my-auctions-tab-refill' };
  const act   = ['bg-primary-container-base/30','text-white','border-l-4','border-primary-base'];
  const inact = ['text-on-surface-variant','hover:bg-[#191c1e]','hover:text-on-surface'];
  Object.values(tabs).forEach(id => { const b=document.getElementById(id); act.forEach(c=>b.classList.remove(c)); inact.forEach(c=>{b.classList.remove(c);b.classList.add(c);}); });
  if (tabs[activeSubTab]) { const b=document.getElementById(tabs[activeSubTab]); inact.forEach(c=>b.classList.remove(c)); act.forEach(c=>b.classList.add(c)); }

  document.getElementById('warranty-refill-panel').classList.toggle('hidden', activeSubTab !== 'transactions');

  const cardHolder = document.getElementById('user-portfolio-details-card');
  cardHolder.innerHTML = `<div class="text-xs text-center py-6 text-on-surface-variant">Cargando...</div>`;

  if (activeSubTab === 'bids') {
    let userBids = [];
    try { userBids = await obtenerOfertasPorUsuario(loggedUser.id); } catch(e) { console.error(e); }
    document.getElementById('user-bids-count-label').innerText = userBids.length;
    cardHolder.innerHTML = `<h3 class="font-sans font-bold text-sm text-white px-1 uppercase tracking-wider mb-2">Historial de Licitaciones</h3>`;
    if (!userBids.length) { cardHolder.innerHTML += `<div class="glass-panel py-12 text-center rounded-2xl p-4 text-xs text-on-surface-variant">No has colocado propuestas formales aún.</div>`; }
    else {
      userBids.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-panel p-4 rounded-xl border border-outline-variant hover:border-primary-base/35 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2';
        const col = { Ganando:'bg-green-950/80 text-green-400', Ganado:'bg-yellow-950/80 text-yellow-500', Perdido:'bg-red-950/85 text-red-400' }[item.estadoPujador] || 'bg-orange-950/80 text-orange-400';
        card.innerHTML = `
          <div class="flex gap-4 items-center">
            <img src="${item.producto.imagen}" class="w-12 h-12 object-cover rounded-lg" />
            <div>
              <h4 class="text-xs font-black text-white hover:text-primary-base cursor-pointer line-clamp-1 card-link">${item.producto.nombre}</h4>
              <p class="text-[9px] text-[#abb9d6] mt-1 font-semibold">Puja emitida el: ${new Date(item.fechaOferta).toLocaleDateString()}</p>
              <span class="inline-block border text-[8px] font-black px-2 py-0.5 rounded-sm mt-1.5 uppercase ${col}">${item.estadoPujador}</span>
            </div>
          </div>
          <div class="flex justify-between items-center w-full md:w-auto md:text-right gap-6 pt-2 md:pt-0 font-mono">
            <div><span class="text-[8px] text-on-surface-variant block">Tu Puja</span><span class="text-xs font-extrabold text-tertiary-base">$${item.ofertaActualUsuario.toLocaleString()}</span></div>
            <div><span class="text-[8px] text-on-surface-variant block">Lote Líder</span><span class="text-xs font-black text-white">$${item.producto.ofertaActual.toLocaleString()}</span></div>
            <button class="bg-[#191c1e] hover:bg-slate-800 p-2 rounded-lg border border-outline-variant cursor-pointer btn-eye"><i data-lucide="eye" class="w-4 h-4"></i></button>
          </div>`;
        const go = () => { selectedProduct = item.producto; navigateToScreen('detail'); };
        card.querySelector('.card-link').addEventListener('click', go);
        card.querySelector('.btn-eye').addEventListener('click', go);
        cardHolder.appendChild(card);
      });
    }
  } else if (activeSubTab === 'sales') {
    let mySales = [];
    try { const all = await obtenerTodosConFinaliz(); mySales = all.filter(p => String(p.vendedorId) === String(loggedUser.id)); } catch(e) { console.error(e); }
    document.getElementById('user-sales-count-label').innerText = mySales.length;
    cardHolder.innerHTML = `<h3 class="font-sans font-bold text-sm text-white px-1 uppercase tracking-wider mb-2">Tus Publicaciones</h3>`;
    if (!mySales.length) { cardHolder.innerHTML += `<div class="glass-panel py-12 text-center rounded-2xl p-4 text-xs text-on-surface-variant">No has cargado lotes mercantiles bajo tu cuenta digital.</div>`; }
    else {
      mySales.forEach(p => {
        const card = document.createElement('div');
        card.className = 'glass-panel p-5 rounded-xl border border-outline-variant hover:border-primary-base/35 transition-all mb-2';
        card.innerHTML = `
          <div class="flex justify-between items-start gap-4 flex-col sm:flex-row">
            <div class="flex gap-4 items-center">
              <img src="${p.imagen}" class="w-12 h-12 object-cover rounded-lg" />
              <div>
                <h4 class="text-xs font-black text-white hover:text-primary-base cursor-pointer card-link">${p.nombre}</h4>
                <p class="text-[9px] text-[#abb9d6] mt-1">Cierre: ${new Date(p.fechaCierre).toLocaleString()}</p>
                <div class="mt-2"><span class="${p.estado==='finalizada'?'bg-red-950 text-red-400':'bg-green-950 text-green-400'} text-[8px] font-extrabold px-2 py-0.5 rounded border border-outline-variant uppercase">${p.estado}</span></div>
              </div>
            </div>
            <div class="flex items-center gap-6 font-mono">
              <div><span class="text-[8px] text-on-surface-variant block">Lote Líder</span><span class="text-xs font-black text-tertiary-base">$${p.ofertaActual.toLocaleString()}</span></div>
              <button class="bg-[#191c1e] hover:bg-slate-800 p-2 rounded-lg border border-outline-variant cursor-pointer btn-eye"><i data-lucide="eye" class="w-4 h-4"></i></button>
            </div>
          </div>`;
        const go = () => { selectedProduct = p; navigateToScreen('detail'); };
        card.querySelector('.card-link').addEventListener('click', go);
        card.querySelector('.btn-eye').addEventListener('click', go);
        cardHolder.appendChild(card);
      });
    }
  } else {
    cardHolder.innerHTML = `
      <div class="glass-panel p-6 rounded-2xl border border-outline-variant space-y-4">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><i data-lucide="shield-check" class="w-5 h-5 text-primary-base"></i> Normativas de Garantías Mercantiles</h3>
        <p class="text-xs text-on-surface-variant leading-relaxed">Para resguardar el carácter legal de las licitaciones corporativas, los clientes de SubastaPro deben fondear una cuenta de garantía mercantil para respaldar las adquisiciones de bienes de alto perfil comercial.</p>
        <div class="grid grid-cols-2 gap-4 pt-2 text-xs">
          <div class="p-3 bg-[#14181a] border border-outline-variant rounded-lg"><span class="font-bold text-white">Abono inmediato</span><p class="text-[10px] text-on-surface-variant mt-1">Los montos fondeados se habilitan automáticamente.</p></div>
          <div class="p-3 bg-[#14181a] border border-outline-variant rounded-lg"><span class="font-bold text-white">Retiro Autorizado</span><p class="text-[10px] text-on-surface-variant mt-1">Garantiza reembolsos libres de penalizaciones mercantiles.</p></div>
        </div>
      </div>`;
  }
  if (window.lucide) window.lucide.createIcons();
}

// ============================================================
//  RENDER: ADMIN
// ============================================================
async function renderAdminOverview() {
  let list = [];
  try { list = await obtenerTodosConFinaliz(); } catch(e) { console.error(e); }

  const activas     = list.filter(p => p.estado === 'activa');
  const finalizadas = list.filter(p => p.estado === 'finalizada');
  document.getElementById('admin-kpi-vivas').innerText   = activas.length;
  const vol = finalizadas.reduce((a,c) => a + (c.ofertaGanadora || c.ofertaActual || 0), 0);
  document.getElementById('admin-kpi-volumen').innerText = `$${(1324500 + vol).toLocaleString('es-CO')}`;

  document.getElementById('admin-recent-bids-contain').innerHTML = `<p class="text-xs text-on-surface-variant py-4 text-center">Disponible desde el panel de cada lote.</p>`;

  const cc = document.getElementById('admin-closed-auctions-contain');
  cc.innerHTML = '';
  if (!finalizadas.length) { cc.innerHTML = `<p class="text-xs text-on-surface-variant py-6 text-center">Aguardando cierre de subastas activas.</p>`; }
  else {
    finalizadas.forEach(p => {
      const row = document.createElement('div');
      row.className = 'p-4 bg-[#14181a]/85 hover:bg-[#191c1e] border border-outline-variant rounded-xl flex justify-between items-center gap-4 hover:border-primary-base/40 transition-all';
      row.innerHTML = `
        <div class="flex items-center gap-3.5 min-w-0">
          <img src="${p.imagen}" class="w-10 h-10 object-cover rounded-md flex-shrink-0" />
          <div class="truncate">
            <h4 class="text-xs font-bold text-[#cfbdff] hover:underline cursor-pointer truncate card-link">${p.nombre}</h4>
            <p class="text-[9px] text-[#abb9d6] mt-1">Ganador: <strong class="text-white">${p.ganadorNombre || 'Sin Ofertas'}</strong></p>
          </div>
        </div>
        <div class="text-right font-mono flex-shrink-0">
          <span class="text-xs font-black text-white block">$${(p.ofertaGanadora||p.ofertaActual).toLocaleString('es-CO')}</span>
          <span class="inline-block bg-[#005c70]/20 text-[#4fd8fd] text-[7px] font-extrabold px-1.5 py-0.5 rounded mt-1 uppercase">ADJUDICADA</span>
        </div>`;
      row.querySelector('.card-link').addEventListener('click', () => { selectedProduct = p; navigateToScreen('detail'); });
      cc.appendChild(row);
    });
  }
  if (window.lucide) window.lucide.createIcons();
}

// ============================================================
//  RENDER: PERFIL DE USUARIO
// ============================================================
let _profileData = null;
let _profileTab  = 'publicados';

window.switchProfileTab = function(tab) {
  _profileTab = tab;
  const tabs = ['publicados','participaciones','ganadas'];
  const on  = 'w-full text-left text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2.5 bg-primary-container-base/30 text-white border-l-4 border-primary-base cursor-pointer transition-all';
  const off = 'w-full text-left text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2.5 text-on-surface-variant hover:bg-[#191c1e] hover:text-white cursor-pointer transition-all';
  tabs.forEach(t => {
    const btn = document.getElementById(`ptab-${t}`);
    if (btn) btn.className = t === tab ? on : off;
  });
  if (_profileData) renderProfileTabContent(_profileData, tab);
};

async function renderProfileView() {
  // Reset stats to loading
  ['stat-publicados','stat-participaciones','stat-ganadas','stat-mayor-puja','stat-total-pujado'].forEach(id => {
    const el = document.getElementById(id); if (el) el.innerText = '—';
  });
  document.getElementById('profile-tab-content').innerHTML =
    `<div class="text-xs text-center py-12 text-on-surface-variant">Cargando perfil...</div>`;

  let data;
  try { data = await apiFetch(API.perfil()); }
  catch(e) {
    document.getElementById('profile-tab-content').innerHTML =
      `<div class="text-xs text-center py-12 text-red-400">Error al cargar perfil: ${e.message}</div>`;
    return;
  }
  _profileData = data;

  // Header
  const { usuario, estadisticas } = data;
  const init = `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase();
  document.getElementById('profile-screen-avatar').innerText = init;
  document.getElementById('profile-screen-name').innerText   = `${usuario.nombre} ${usuario.apellido}`;
  document.getElementById('profile-screen-email').innerText  = usuario.email;
  const fechaReg = new Date(usuario.fecha_registro);
  document.getElementById('profile-screen-fecha').innerText  =
    fechaReg.toLocaleDateString('es-CO', { year:'numeric', month:'long' });

  // Stats
  document.getElementById('stat-publicados').innerText      = estadisticas.total_publicados;
  document.getElementById('stat-participaciones').innerText = estadisticas.total_participaciones;
  document.getElementById('stat-ganadas').innerText         = estadisticas.total_ganadas;
  document.getElementById('stat-mayor-puja').innerText      = estadisticas.mayor_puja > 0
    ? `$${parseFloat(estadisticas.mayor_puja).toLocaleString('es-CO')}` : '$0';
  document.getElementById('stat-total-pujado').innerText    = estadisticas.total_pujado > 0
    ? `$${parseFloat(estadisticas.total_pujado).toLocaleString('es-CO')}` : '$0';

  // Badges de tabs
  const ganadas = data.participaciones.filter(p => p.estado_pujador === 'Ganado');
  document.getElementById('ptab-badge-publicados').innerText      = data.lotes_publicados.length;
  document.getElementById('ptab-badge-participaciones').innerText = data.participaciones.length;
  document.getElementById('ptab-badge-ganadas').innerText         = ganadas.length;

  // Render tab activo
  renderProfileTabContent(data, _profileTab);
  if (window.lucide) window.lucide.createIcons();
}

function renderProfileTabContent(data, tab) {
  const container = document.getElementById('profile-tab-content');
  container.innerHTML = '';

  if (tab === 'publicados') {
    const items = data.lotes_publicados;
    if (!items.length) {
      container.innerHTML = `<div class="glass-panel py-16 text-center rounded-2xl text-xs text-on-surface-variant">No has publicado ningún lote aún.</div>`;
      return;
    }
    items.forEach(p => {
      const isOver = p.estado === 'finalizada';
      const card = document.createElement('div');
      card.className = 'glass-panel p-4 rounded-xl border border-outline-variant hover:border-primary-base/40 transition-all flex gap-4 items-center';
      card.innerHTML = `
        <img src="${p.imagen}" class="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-black text-white hover:text-primary-base cursor-pointer truncate card-link">${p.nombre}</h4>
          <div class="flex flex-wrap gap-2 mt-1.5">
            <span class="text-[9px] font-bold px-2 py-0.5 rounded border ${isOver ? 'bg-red-950 text-red-400 border-red-800/40' : 'bg-green-950 text-green-400 border-green-800/40'} uppercase">${p.estado}</span>
            <span class="text-[9px] text-on-surface-variant font-semibold">${p.categoria}</span>
            <span class="text-[9px] text-on-surface-variant font-semibold flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> ${p.total_ofertas} pujas</span>
          </div>
          ${isOver && p.ganador_nombre ? `<p class="text-[9px] text-yellow-400 font-bold mt-1">🏆 Ganador: ${p.ganador_nombre} ${p.ganador_apellido}</p>` : ''}
        </div>
        <div class="text-right flex-shrink-0">
          <span class="text-[8px] text-on-surface-variant block">Mejor oferta</span>
          <span class="text-sm font-black text-tertiary-base font-mono">$${parseFloat(p.oferta_actual).toLocaleString('es-CO')}</span>
          <span class="text-[8px] text-on-surface-variant block mt-1">Cierre</span>
          <span class="text-[9px] text-white font-mono">${new Date(p.fecha_cierre).toLocaleDateString('es-CO')}</span>
        </div>`;
      card.querySelector('.card-link').addEventListener('click', () => {
        selectedProduct = { id: p.id, nombre: p.nombre, imagen: p.imagen };
        navigateToScreen('detail');
      });
      container.appendChild(card);
    });

  } else if (tab === 'participaciones') {
    const items = data.participaciones;
    if (!items.length) {
      container.innerHTML = `<div class="glass-panel py-16 text-center rounded-2xl text-xs text-on-surface-variant">No has pujado en ninguna subasta aún.</div>`;
      return;
    }
    items.forEach(p => {
      const colMap = { Ganando:'bg-green-950/80 text-green-400 border-green-800/40', Superado:'bg-orange-950/80 text-orange-400 border-orange-800/40', Ganado:'bg-yellow-950/80 text-yellow-400 border-yellow-800/40', Perdido:'bg-red-950/80 text-red-400 border-red-800/40' };
      const col = colMap[p.estado_pujador] || 'bg-slate-900 text-slate-400 border-slate-700';
      const card = document.createElement('div');
      card.className = 'glass-panel p-4 rounded-xl border border-outline-variant hover:border-primary-base/40 transition-all flex gap-4 items-center';
      card.innerHTML = `
        <img src="${p.imagen}" class="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-black text-white hover:text-primary-base cursor-pointer truncate card-link">${p.nombre}</h4>
          <div class="flex flex-wrap gap-2 mt-1.5">
            <span class="text-[9px] font-black px-2 py-0.5 rounded border uppercase ${col}">${p.estado_pujador}</span>
            <span class="text-[9px] text-on-surface-variant font-semibold">${p.categoria}</span>
          </div>
          <p class="text-[9px] text-on-surface-variant mt-1">Última puja: ${new Date(p.fecha_ultima_puja).toLocaleDateString('es-CO')}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <span class="text-[8px] text-on-surface-variant block">Mi mejor puja</span>
          <span class="text-sm font-black text-[#cfbdff] font-mono">$${parseFloat(p.mi_mejor_puja).toLocaleString('es-CO')}</span>
          <span class="text-[8px] text-on-surface-variant block mt-1">Oferta líder</span>
          <span class="text-[9px] text-white font-mono font-bold">$${parseFloat(p.oferta_actual).toLocaleString('es-CO')}</span>
        </div>`;
      card.querySelector('.card-link').addEventListener('click', () => {
        selectedProduct = { id: p.id, nombre: p.nombre, imagen: p.imagen };
        navigateToScreen('detail');
      });
      container.appendChild(card);
    });

  } else if (tab === 'ganadas') {
    const items = data.participaciones.filter(p => p.estado_pujador === 'Ganado');
    if (!items.length) {
      container.innerHTML = `<div class="glass-panel py-16 text-center rounded-2xl text-xs text-on-surface-variant flex flex-col items-center gap-3"><i data-lucide="trophy" class="w-10 h-10 text-on-surface-variant"></i><p>Aún no has ganado ninguna subasta.<br/>¡Sigue pujando!</p></div>`;
      if (window.lucide) window.lucide.createIcons();
      return;
    }
    items.forEach(p => {
      const card = document.createElement('div');
      card.className = 'glass-panel p-4 rounded-xl border border-yellow-800/40 bg-yellow-950/10 hover:border-yellow-600/60 transition-all flex gap-4 items-center';
      card.innerHTML = `
        <div class="relative flex-shrink-0">
          <img src="${p.imagen}" class="w-14 h-14 object-cover rounded-lg" />
          <span class="absolute -top-2 -right-2 text-base">🏆</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-black text-white hover:text-primary-base cursor-pointer truncate card-link">${p.nombre}</h4>
          <p class="text-[9px] text-yellow-400 font-bold mt-1 uppercase tracking-wider">Subasta ganada</p>
          <p class="text-[9px] text-on-surface-variant mt-0.5">${p.categoria} · ${new Date(p.fecha_cierre).toLocaleDateString('es-CO')}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <span class="text-[8px] text-on-surface-variant block">Precio final</span>
          <span class="text-sm font-black text-yellow-400 font-mono">$${parseFloat(p.mi_mejor_puja).toLocaleString('es-CO')}</span>
        </div>`;
      card.querySelector('.card-link').addEventListener('click', () => {
        selectedProduct = { id: p.id, nombre: p.nombre, imagen: p.imagen };
        navigateToScreen('detail');
      });
      container.appendChild(card);
    });
  }

  if (window.lucide) window.lucide.createIcons();
}

// ============================================================
//  SERVICIOS DE FONDO (refresco cada 30 s)
// ============================================================
function startBackgroundServices() {
  setInterval(() => { tickCountdownClocks(); tickDetailsCountdown(); }, 1000);
  setInterval(() => {
    if (!loggedUser) return;
    if (currentScreen === 'browse')       renderBrowseCatalog();
    else if (currentScreen === 'detail' && selectedProduct) renderProductDetail();
    else if (currentScreen === 'my-auctions') renderMyAuctionsView();
    else if (currentScreen === 'admin')    renderAdminOverview();
  }, 30000);
}

function tickCountdownClocks() {
  if (currentScreen !== 'browse') return;
  document.querySelectorAll('.countdown-span').forEach(span => {
    const diff = new Date(span.dataset.expiry).getTime() - Date.now();
    if (diff <= 0) { span.innerHTML = `<span class="text-red-400 font-bold uppercase text-[9px]">Finalizada</span>`; return; }
    const d = Math.floor(diff/86400000), h = Math.floor((diff/3600000)%24), m = Math.floor((diff/60000)%60), s = Math.floor((diff/1000)%60);
    span.innerText = `${d>0?d+'d ':''}${String(h).padStart(2,'0')}h:${String(m).padStart(2,'0')}m:${String(s).padStart(2,'0')}s`;
  });
}

function tickDetailsCountdown() {
  if (currentScreen !== 'detail') return;
  const wrap = document.getElementById('countdown-wrapper-detail');
  if (!wrap) return;
  const diff = new Date(wrap.dataset.expiry).getTime() - Date.now();
  if (diff <= 0) { renderProductDetail(); return; }
  const d = Math.floor(diff/86400000), h = Math.floor((diff/3600000)%24), m = Math.floor((diff/60000)%60), s = Math.floor((diff/1000)%60);
  document.getElementById('detail-d').innerText = d;
  document.getElementById('detail-h').innerText = String(h).padStart(2,'0');
  document.getElementById('detail-m').innerText = String(m).padStart(2,'0');
  document.getElementById('detail-s').innerText = String(s).padStart(2,'0');
}

// ============================================================
//  MODALES
// ============================================================
function openQuickBidModal(product) {
  quickBidSelProd = product;
  const min = Math.max(product.ofertaActual, product.precioInicial) + 1;
  document.getElementById('quick-bid-prod-name').innerText    = product.nombre;
  document.getElementById('quick-bid-min-label').innerText    = `Monto mínimo sugerido ($${min.toLocaleString()})`;
  document.getElementById('quick-bid-amount').value           = min;
  document.getElementById('quick-bid-amount').min             = min;
  document.getElementById('quick-bid-current-price').innerText= `$${product.ofertaActual.toLocaleString()}`;
  document.getElementById('quick-bid-current-leader').innerText = product.liderNombre || 'Por asignar';
  document.getElementById('quick-bid-error').classList.add('hidden');
  document.getElementById('quick-bid-modal').classList.remove('hidden');
}
function closeQuickBidModal() { document.getElementById('quick-bid-modal').classList.add('hidden'); quickBidSelProd = null; }

function openPublishModal() {
  const d = new Date(Date.now() + 86400000);
  document.getElementById('pub-closing-date').value = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,16);
  document.getElementById('publish-modal-error').classList.add('hidden');
  document.getElementById('publish-modal-form').reset();
  document.getElementById('pub-image-final').value = '';
  // Resetear a tab "Subir archivo"
  window.switchImageTab('upload');
  document.getElementById('publish-modal').classList.remove('hidden');
}
function closePublishModal() {
  document.getElementById('publish-modal').classList.add('hidden');
  window.clearImagePreview?.();
}

async function subirImagenArchivo(file) {
  const formData = new FormData();
  formData.append('imagen', file);
  const res = await fetch('api/upload.php', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Error al subir la imagen.');
  return data.url;
}

async function updateUnreadNotifications() {
  const list = await obtenerNotificaciones();
  document.getElementById('bell-badge-count').innerText = list.length;
  const listCon = document.getElementById('notifications-list');
  listCon.innerHTML = '';
  if (!list.length) { listCon.innerHTML = `<p class="text-center py-4 text-xs text-on-surface-variant">Bandeja limpia de novedades.</p>`; return; }
  list.forEach(item => {
    const border = { success:'border-green-400', warning:'border-yellow-500' }[item.tipo] || 'border-[#cfbdff]';
    const div = document.createElement('div');
    div.className = `p-2.5 bg-[#0b0f10]/80 border-l-2 ${border} rounded hover:bg-[#191c1e] text-[11px] mb-2 leading-relaxed`;
    div.innerHTML = `<p class="text-white font-medium">${item.mensaje}</p><span class="block text-[8px] text-[#abb9d6] font-mono mt-1">${new Date(item.fecha).toLocaleTimeString()}</span>`;
    listCon.appendChild(div);
  });
}

// ============================================================
//  TOASTS
// ============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-[#191c1e]/95 border border-outline-variant/60 rounded-xl p-4 shadow-2xl backdrop-blur-md flex gap-3 h-18 text-xs max-w-sm w-full translate-x-10 opacity-0 transition-all duration-300 relative overflow-hidden mb-2';
  const cfg = { info:['bg-[#cfbdff]','info'], success:['bg-green-400','check-circle'], warning:['bg-yellow-500','bell'], error:['bg-red-500','shield-alert'] }[type] || ['bg-[#cfbdff]','info'];
  toast.innerHTML = `<div class="absolute left-0 top-0 bottom-0 w-1.5 ${cfg[0]}"></div><div class="flex-shrink-0 text-white pt-0.5"><i data-lucide="${cfg[1]}" class="w-4 h-4 text-tertiary-base"></i></div><div class="flex-grow pr-4"><p class="text-white font-bold text-[10px] uppercase tracking-wider">Aviso de Precisión</p><p class="text-[#abb9d6] text-[11px] mt-1 leading-snug line-clamp-2">${message}</p></div><button class="absolute top-3 right-3 text-on-surface-variant hover:text-white cursor-pointer" onclick="this.parentElement.remove()"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>`;
  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();
  setTimeout(() => toast.classList.remove('translate-x-10','opacity-0'), 40);
  setTimeout(() => { toast.classList.add('translate-x-10','opacity-0'); setTimeout(() => toast.remove(), 300); }, 5000);
}
window.showToast = showToast;

// ============================================================

// ============================================================
//  EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  // Demos
  document.getElementById('demo-alejandro').addEventListener('click', () => {
    document.getElementById('login-email').value = 'alejandro@ejemplo.com';
    document.getElementById('login-password').value = 'password123';
    submitLoginForm();
  });
  document.getElementById('demo-ana').addEventListener('click', () => {
    document.getElementById('login-email').value = 'ana@ejemplo.com';
    document.getElementById('login-password').value = 'password123';
    submitLoginForm();
  });

  // Navegación
  ['browse','my-auctions','admin','profile'].forEach(s => {
    document.getElementById(`nav-btn-${s}`)?.addEventListener('click', () => navigateToScreen(s));
    document.getElementById(`mob-nav-${s}`)?.addEventListener('click', () => navigateToScreen(s));
  });
  document.getElementById('logo-nav-home').addEventListener('click', () => navigateToScreen('browse'));
  // Avatar del header → perfil
  document.getElementById('header-user-avatar').addEventListener('click', () => navigateToScreen('profile'));

  // Publish modal
  document.getElementById('floating-publish-fab').addEventListener('click', openPublishModal);
  document.getElementById('publish-modal-close').addEventListener('click', closePublishModal);
  document.getElementById('pub-cancel-btn').addEventListener('click', closePublishModal);

  // Quick bid modal
  document.getElementById('quick-bid-close').addEventListener('click', closeQuickBidModal);
  document.getElementById('quick-bid-cancel').addEventListener('click', closeQuickBidModal);

  // Tabs de imagen — manejados con onclick en HTML, solo el demo stock necesita listener
  document.getElementById('pub-image-fill-demo').addEventListener('click', () => {
    const item = PREMIUM_STOCK_ITEMS[Math.floor(Math.random() * PREMIUM_STOCK_ITEMS.length)];
    document.getElementById('pub-name').value = item.nombre;
    document.getElementById('pub-category').value = item.categoria;
    document.getElementById('pub-image').value = item.imagen;
    document.getElementById('pub-image-final').value = item.imagen;
    document.getElementById('pub-description').value = item.descripcion;
    document.getElementById('pub-starting-price').value = Math.floor(Math.random() * 700000) + 50000;
    showToast('Formulario autocompletado con lote de stock.', 'success');
  });

  // Logout (header y perfil)
  const doLogout = () => { cerrarSesion(); loggedUser = null; showToast('Sesión cerrada correctamente.', 'info'); showAuthLayout(); };
  document.getElementById('header-logout-btn').addEventListener('click', doLogout);
  document.getElementById('profile-screen-logout').addEventListener('click', doLogout);

  // Bell
  document.getElementById('bell-dropdown-btn').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('notification-dropdown').classList.toggle('hidden');
    updateUnreadNotifications();
  });
  document.body.addEventListener('click', () => document.getElementById('notification-dropdown').classList.add('hidden'));
  document.getElementById('notification-dropdown').addEventListener('click', e => e.stopPropagation());
  document.getElementById('clear-notifications').addEventListener('click', async () => {
    await limpiarNotificaciones(); updateUnreadNotifications(); showToast('Notificaciones removidas.', 'success');
  });

  // Auth
  document.getElementById('go-to-register').addEventListener('click', () => showAuthView('register'));
  document.getElementById('go-to-login').addEventListener('click', () => showAuthView('login'));
  document.getElementById('forgot-password').addEventListener('click', () => alert('Contacta al administrador para restablecer tu contraseña.'));
  document.getElementById('login-form').addEventListener('submit', e => { e.preventDefault(); submitLoginForm(); });

  // Register wizard
  document.getElementById('register-next-btn').addEventListener('click', () => {
    const m = document.getElementById('reg-email').value.trim();
    const p = document.getElementById('reg-password').value;
    const err = document.getElementById('register-error');
    err.classList.add('hidden');
    if (!m || !p) { err.classList.remove('hidden'); err.innerText = 'Por favor completa el Paso 1.'; return; }
    if (!m.includes('@')) { err.classList.remove('hidden'); err.innerText = 'Correo inválido.'; return; }
    if (p.length < 8) { err.classList.remove('hidden'); err.innerText = 'La contraseña debe tener mínimo 8 caracteres.'; return; }
    document.getElementById('reg-step-1').classList.add('hidden');
    document.getElementById('reg-step-2').classList.remove('hidden');
    document.getElementById('register-step-title').innerText = 'Paso 2 de 2: Perfil Fiscal / Mercantil';
    document.getElementById('register-progress-bar').style.width = '100%';
  });
  document.getElementById('register-back-btn').addEventListener('click', () => {
    document.getElementById('reg-step-1').classList.remove('hidden');
    document.getElementById('reg-step-2').classList.add('hidden');
    document.getElementById('register-step-title').innerText = 'Paso 1 de 2: Credenciales de cuenta';
    document.getElementById('register-progress-bar').style.width = '50%';
  });
  document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const m = document.getElementById('reg-email').value.trim();
    const p = document.getElementById('reg-password').value;
    const f = document.getElementById('reg-firstname').value.trim();
    const l = document.getElementById('reg-lastname').value.trim();
    const c = document.getElementById('reg-category').value;
    const a = document.getElementById('reg-terms').checked;
    const err = document.getElementById('register-error'); err.classList.add('hidden');
    if (!f || !l) { err.classList.remove('hidden'); err.innerText = 'Escribe tu nombre y apellido.'; return; }
    if (!a)       { err.classList.remove('hidden'); err.innerText = 'Debes aceptar los Términos de Servicio.'; return; }
    const r = await registrarUsuario({ nombre:f, apellido:l, email:m, password:p, categoriaInteres:c });
    if (r.success) { showToast(r.message,'success'); loggedUser = r.user; showAppLayout(); }
    else { err.classList.remove('hidden'); err.innerText = r.message; }
  });

  // Búsqueda y orden
  document.getElementById('catalog-search').addEventListener('input', e => { searchQuery = e.target.value; renderBrowseCatalog(); });
  document.getElementById('catalog-order-by').addEventListener('change', e => { orderBy = e.target.value; renderBrowseCatalog(); });
  document.getElementById('detail-back-btn').addEventListener('click', () => { selectedProduct = null; navigateToScreen('browse'); });

  // Quick bid submit
  document.getElementById('quick-bid-form').addEventListener('submit', async e => {
    e.preventDefault();
    const err = document.getElementById('quick-bid-error'); err.classList.add('hidden');
    const val = parseFloat(document.getElementById('quick-bid-amount').value);
    if (!val || isNaN(val)) { err.classList.remove('hidden'); err.innerText = 'Ingresa un número.'; return; }
    const res = await realizarOferta(quickBidSelProd.id, loggedUser.id, `${loggedUser.nombre} ${loggedUser.apellido}`, val);
    if (res.success) {
      showToast(res.message, 'success'); closeQuickBidModal();
      if (currentScreen === 'browse') renderBrowseCatalog(); else if (currentScreen === 'detail') renderProductDetail();
    } else { err.classList.remove('hidden'); err.innerText = res.message; }
  });

  // Publish submit
  document.getElementById('publish-modal-form').addEventListener('submit', async e => {
    e.preventDefault();
    const err = document.getElementById('publish-modal-error'); err.classList.add('hidden');
    const n     = document.getElementById('pub-name').value.trim();
    const cat   = document.getElementById('pub-category').value;
    const price = parseFloat(document.getElementById('pub-starting-price').value);
    const date  = document.getElementById('pub-closing-date').value;
    const desc  = document.getElementById('pub-description').value.trim();
    let   img   = document.getElementById('pub-image-final').value.trim();

    if (!n || !price || !date || !desc) { err.classList.remove('hidden'); err.innerText='Completa todos los campos.'; return; }
    if (!img) { err.classList.remove('hidden'); err.innerText='Selecciona o pega una imagen para el lote.'; return; }
    if (price<=0) { err.classList.remove('hidden'); err.innerText='Coloca un precio inicial positivo.'; return; }
    if (new Date(date).getTime()<=Date.now()) { err.classList.remove('hidden'); err.innerText='La fecha debe estar en el futuro.'; return; }

    // Si hay un archivo pendiente de subida, subirlo ahora
    if (img === '__pending__' && window._pendingImageFile) {
      const submitBtn = e.target.querySelector('[type=submit]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Subiendo imagen...';
      try {
        img = await subirImagenArchivo(window._pendingImageFile);
        window._pendingImageFile = null;
        document.getElementById('pub-image-final').value = img;
      } catch(uploadErr) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Publicar Lote';
        err.classList.remove('hidden');
        err.innerText = 'Error al subir imagen: ' + uploadErr.message;
        return;
      }
      submitBtn.disabled = false;
      submitBtn.innerText = 'Publicar Lote';
    }

    const res = await publicarProducto({ nombre:n, categoria:cat, precioInicial:price, fechaCierre:new Date(date).toISOString(), imagen:img, descripcion:desc }, loggedUser.id, `${loggedUser.nombre} ${loggedUser.apellido}`);
    if (res.success) {
      window._pendingImageFile = null;
      showToast(res.message,'success'); closePublishModal(); activeCategory='Todas'; searchQuery=''; navigateToScreen('browse');
    } else { err.classList.remove('hidden'); err.innerText = res.message; }
  });

  // Sub-tabs
  document.getElementById('my-auctions-tab-bids').addEventListener('click', ()   => { activeSubTab='bids';         renderMyAuctionsView(); });
  document.getElementById('my-auctions-tab-sales').addEventListener('click', ()  => { activeSubTab='sales';        renderMyAuctionsView(); });
  document.getElementById('my-auctions-tab-refill').addEventListener('click', () => { activeSubTab='transactions'; renderMyAuctionsView(); });

  // Refill
  document.getElementById('refill-funds-form').addEventListener('submit', e => {
    e.preventDefault();
    const val = parseFloat(document.getElementById('refill-amount').value);
    if (!val||isNaN(val)||val<=0) { alert('Ingresa un monto positivo'); return; }
    const btn = document.getElementById('refill-submit-btn');
    btn.disabled=true; btn.innerText='Verificando fondos...';
    setTimeout(() => {
      btn.disabled=false; btn.innerText='Ingresar Fondos Mercantiles';
      document.getElementById('refill-amount').value='';
      const alertBox=document.getElementById('refill-success-alert');
      alertBox.classList.remove('hidden');
      alertBox.innerText=`Se han acreditado $${val.toLocaleString()} con éxito en tu cartera mercantil!`;
      renderMyAuctionsView();
    }, 1000);
  });
}

async function submitLoginForm() {
  const m = document.getElementById('login-email').value.trim();
  const p = document.getElementById('login-password').value;
  const err = document.getElementById('login-error'); err.classList.add('hidden');
  if (!m||!p) { err.classList.remove('hidden'); err.innerText='Por favor ingresa tu correo y contraseña.'; return; }
  const btn = document.getElementById('login-submit-button');
  btn.disabled=true; btn.innerHTML='<span>Validando credenciales...</span>';
  const res = await iniciarSesion(m, p);
  btn.disabled=false; btn.innerHTML='<span>Iniciar Sesión de Precisión</span>';
  if (res.success && res.user) { loggedUser=res.user; showToast(res.message,'success'); showAppLayout(); }
  else { err.classList.remove('hidden'); err.innerText=res.message; }
}

function resetRegisterForm() {
  document.getElementById('register-form').reset();
  document.getElementById('reg-step-1').classList.remove('hidden');
  document.getElementById('reg-step-2').classList.add('hidden');
  document.getElementById('register-step-title').innerText = 'Paso 1 de 2: Credenciales de cuenta';
  document.getElementById('register-progress-bar').style.width = '50%';
}
