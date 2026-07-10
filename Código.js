function doGet(e) {
  console.log("SERVER DEBUG: Iniciando enrutamiento de dashboards...");
  
  let page = 'login';
  let title = 'Antigravity Salon - Login Seguro';
  
  const param = e && e.parameter && e.parameter.p ? e.parameter.p.toLowerCase() : '';
  const token = e && e.parameter && e.parameter.token ? e.parameter.token : '';
  
  // Enrutamiento si el usuario viene con un token válido desde el login
  if (token !== '') {
    if (param === 'caja') {
      page = 'cajaDashboard';
      title = 'Dashboard Caja - Antigravity Salon';
    } else if (param === 'insumos') {
      page = 'despachoInsumos';
      title = 'Inventario & Despacho Insumos - Antigravity Salon';
    } else if (param === 'reportes') {
      page = 'reportesDashboard';
      title = 'Reportes & Estadísticas - Antigravity Salon';
    } else if (param === 'recepcion' || param === 'desarrollador') {
      page = 'recepcionDashboard';
      title = 'Dashboard Recepción - Antigravity Salon';
    } else {
      page = 'recepcionDashboard'; // Default fallback si hay token
      title = 'Dashboard Recepción - Antigravity Salon';
    }
  }

  try {
    const htmlTemplate = HtmlService.createTemplateFromFile(page);
    
    // Inyectar variables de Supabase para el cliente JS
    htmlTemplate.supabaseUrl = "https://jkwlvexclifwdpnzshpt.supabase.co";
    htmlTemplate.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprd2x2ZXhjbGlmd2RwbnpzaHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjg1ODQsImV4cCI6MjA5NTY0NDU4NH0.2cYEomsvL5YoV9mvnaxvZj-CBn43sO_S1flfhE7pZLo";

    const htmlOutput = htmlTemplate.evaluate();
    
    htmlOutput.setTitle(title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
              
    console.log(`SERVER DEBUG: Servido ${page} exitosamente.`);
    return htmlOutput;
  } catch (err) {
    console.error(`SERVER DEBUG CRÍTICO: Error al servir ${page}: ` + err.message, err.stack);
    return HtmlService.createHtmlOutput(`
      <html>
        <body style="background: #0f172a; color: #f1f5f9; font-family: sans-serif; padding: 30px; text-align: center;">
          <h1 style="color: #ef4444;">Error Crítico del Servidor</h1>
          <p>No se pudo cargar la vista inicial: ${err.message}</p>
        </body>
      </html>
    `).setTitle("Error de Servidor").setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Devuelve la URL pública del Script para redirecciones
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * Función expuesta para cargar el Dashboard una vez autenticado
 */
function getDashboardHtml(rolePage) {
  console.log("SERVER DEBUG: Cargando HTML para " + rolePage);
  let page = 'recepcionDashboard';
  if (rolePage === 'caja') page = 'cajaDashboard';
  else if (rolePage === 'insumos') page = 'despachoInsumos';
  else if (rolePage === 'reportes') page = 'reportesDashboard';
  
  const template = HtmlService.createTemplateFromFile(page);
  
  // Inyectar variables de Supabase para el cliente JS
  template.supabaseUrl = "https://jkwlvexclifwdpnzshpt.supabase.co";
  template.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprd2x2ZXhjbGlmd2RwbnpzaHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjg1ODQsImV4cCI6MjA5NTY0NDU4NH0.2cYEomsvL5YoV9mvnaxvZj-CBn43sO_S1flfhE7pZLo";

  return template.evaluate().getContent();
}

function include(filename) {
  const cleanFilename = filename.replace(/\.html$/, '');
  try {
    console.log("SERVER DEBUG: Incluyendo sub-plantilla:", cleanFilename);
    const template = HtmlService.createTemplateFromFile(cleanFilename);
    // Inyectamos las credenciales para que las subplantillas también las tengan
    template.supabaseUrl = "https://jkwlvexclifwdpnzshpt.supabase.co";
    template.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprd2x2ZXhjbGlmd2RwbnpzaHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjg1ODQsImV4cCI6MjA5NTY0NDU4NH0.2cYEomsvL5YoV9mvnaxvZj-CBn43sO_S1flfhE7pZLo";
    return template.evaluate().getContent();
  } catch (err) {
    console.error("SERVER DEBUG: Error al incluir sub-plantilla '" + filename + "' (limpio: '" + cleanFilename + "'): " + err.message);
    return `/* ERROR INCLUYENDO ${filename}: ${err.message} */`;
  }
}



/**
 * 🛠️ APIS DEL PANEL SECRETO (CRUD DIRECTO A SUPABASE)
 */
function obtenerDatosTablaSecreta(tabla) {
  try {
    // Si consulta la papelera, traemos todo
    if (tabla === 'garbage') {
      return Supabase.select("garbage", "select=*&order=fecha_eliminacion.desc");
    }
    // De lo contrario, traemos la tabla seleccionada ordenada por creación
    return Supabase.select(tabla, "select=*&order=created_at.desc");
  } catch(e) {
    throw new Error("No se pudo obtener la información de Supabase: " + e.message);
  }
}

function crearFilaSecreta(tabla, datos) {
  try {
    return Supabase.insert(tabla, datos);
  } catch(e) {
    throw new Error("Error al crear fila: " + e.message);
  }
}

function editarFilaSecreta(tabla, id, datos) {
  try {
    return Supabase.update(tabla, datos, `id=eq.${id}`);
  } catch(e) {
    throw new Error("Error al modificar fila: " + e.message);
  }
}

/**
 * 🗑️ BORRADO LÓGICO E INTEGRACIÓN CON LA PAPELERA (GARBAGE)
 */
function eliminarFilaSecretaConGarbage(tabla, id, justificacion) {
  try {
    // 1. Obtener la fila completa antes de borrarla
    const registros = Supabase.select(tabla, `id=eq.${id}`);
    if (!registros || registros.length === 0) throw new Error("Registro no encontrado.");
    const datosBorrados = registros[0];

    // 2. Insertar una copia en public.garbage
    const registroGarbage = {
      tabla_origen: tabla,
      registro_id: id,
      datos_eliminados: datosBorrados,
      justificacion: justificacion
      // Nota: eliminado_por puede enlazarse al ID de sesión de ser requerido
    };
    Supabase.insert("garbage", registroGarbage);

    // 3. Eliminar físicamente el registro de la tabla original
    Supabase.delete(tabla, `id=eq.${id}`);

    return true;
  } catch(e) {
    throw new Error("Error en el flujo de borrado: " + e.message);
  }
}

/**
 * 🔄 RESTAURACIÓN DESDE PAPELERA
 */
function restaurarFilaSecreta(garbageId) {
  try {
    // 1. Obtener el registro de la papelera
    const garbageRecords = Supabase.select("garbage", `id=eq.${garbageId}`);
    if (!garbageRecords || garbageRecords.length === 0) throw new Error("Registro de basura no encontrado.");
    const item = garbageRecords[0];

    const tablaOriginal = item.tabla_origen;
    const datosOriginales = item.datos_eliminados;

    // 2. Volver a insertarlo en su tabla original
    Supabase.insert(tablaOriginal, datosOriginales);

    // 3. Quitarlo de la papelera
    Supabase.delete("garbage", `id=eq.${garbageId}`);

    return true;
  } catch(e) {
    throw new Error("Error al restaurar: " + e.message);
  }
}

// Libros (Lazy loading para evitar bloqueos en doGet)
let _registrosAdmin = null;
Object.defineProperty(globalThis, 'RegistrosAdmin', {
  get: function() {
    if (!_registrosAdmin) _registrosAdmin = SpreadsheetApp.openById("1SXuedQigLxVUF2oxn65wEZ5-HnDDiVdy7lY7HaweVC4");
    return _registrosAdmin;
  }
});

let _registrosRecepcion = null;
Object.defineProperty(globalThis, 'RegistrosRecepcion', {
  get: function() {
    if (!_registrosRecepcion) _registrosRecepcion = SpreadsheetApp.openById("1SXuedQigLxVUF2oxn65wEZ5-HnDDiVdy7lY7HaweVC4");
    return _registrosRecepcion;
  }
});
