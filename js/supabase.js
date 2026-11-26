/* Zinguería Z-1 · guarda cada consulta del formulario en Supabase.
   Es independiente de main.js: no bloquea ni cambia el envío a WhatsApp.
   La clave "publishable" es pública por diseño; la seguridad la dan las políticas RLS. */
(function () {
  'use strict';
  var URL_BASE = 'https://fyheuogmjqpizhjaobnt.supabase.co';
  var KEY = 'sb_publishable_GyEESFbdqdqg89GptLFnxg_wsvweoTS';
  var BUCKET = 'consultas-fotos';
  var MAX_FOTO = 5 * 1024 * 1024; // 5 MB, igual que el bucket

  var form = document.getElementById('form');
  if (!form) return;

  var enviando = false;

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 3) | 8).toString(16);
    });
  }

  function subirFoto(id, file) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0 || file.size > MAX_FOTO) {
      return Promise.resolve(null);
    }
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg';
    var path = id + '/foto.' + ext;
    return fetch(URL_BASE + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': file.type, 'x-upsert': 'false' },
      body: file
    }).then(function (r) { return r.ok ? path : null; })
      .catch(function () { return null; });
  }

  function insertar(fila, conKeepalive) {
    return fetch(URL_BASE + '/rest/v1/consultas', {
      method: 'POST',
      headers: {
        apikey: KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(fila),
      keepalive: !!conKeepalive
    });
  }

  form.addEventListener('submit', function () {
    // Mismas reglas mínimas que el formulario: si faltan datos, main.js ya muestra los errores.
    var nombre = val('nombre'), tel = val('tel'), prod = val('prod');
    if (!nombre || !tel || !prod || enviando) return;

    enviando = true;
    var cant = parseInt(val('cant'), 10);
    if (!(cant >= 1)) cant = 1;

    var id = uuid();
    var fotoInput = document.getElementById('foto');
    var file = fotoInput && fotoInput.files && fotoInput.files[0];

    var fila = {
      id: id,
      nombre: nombre.slice(0, 120),
      telefono: tel.slice(0, 40),
      producto: prod.slice(0, 120),
      medidas: val('med').slice(0, 300) || null,
      cantidad: cant,
      descripcion: val('desc').slice(0, 2000) || null
    };

    subirFoto(id, file)
      .then(function (path) {
        if (path) fila.foto_path = path;
        return insertar(fila, !path);
      })
      .catch(function () { /* nunca interrumpir al visitante */ })
      .then(function () { setTimeout(function () { enviando = false; }, 3000); });
  });
})();
