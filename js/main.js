(function(){
'use strict';
var PHONE='5491164792717';
var BASE='Hola, vi su página de Zinguería Z-1 y quisiera consultar por ';
function wa(t){return 'https://wa.me/'+PHONE+'?text='+encodeURIComponent(t)}
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

/* Enlaces de WhatsApp con mensaje */
$$('[data-wa]').forEach(function(a){a.href=wa(BASE+'un producto y solicitar un presupuesto.')});
$$('[data-wa-p]').forEach(function(a){
  a.href=wa(BASE+a.getAttribute('data-wa-p')+' y solicitar un presupuesto.');
  a.target='_blank';a.rel='noopener';
});
$('#yr').textContent=new Date().getFullYear();

/* Menú móvil */
var burger=$('#burger'),menu=$('#menu');
function closeMenu(){menu.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Abrir menú')}
burger.addEventListener('click',function(){
  var o=menu.classList.toggle('open');
  burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');
});
menu.addEventListener('click',function(e){if(e.target.closest('a'))closeMenu()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});

/* Filtros */
$$('.filters').forEach(function(box){
  var grid=$(box.getAttribute('data-filter'));
  box.addEventListener('click',function(e){
    var b=e.target.closest('.chip');if(!b)return;
    $$('.chip',box).forEach(function(c){var on=c===b;c.classList.toggle('is-on',on);c.setAttribute('aria-pressed',on)});
    var f=b.getAttribute('data-f');
    $$('[data-cat]',grid).forEach(function(i){i.classList.toggle('is-hidden',f!=='all'&&i.getAttribute('data-cat')!==f)});
  });
});

/* Lightbox */
var lb=$('#lb'),lbi=$('#lbi'),lbc=$('#lbc');
document.addEventListener('click',function(e){
  var z=e.target.closest('[data-zoom]');
  if(z&&lb.showModal){
    var im=$('img',z);lbi.src=z.getAttribute('data-zoom');lbi.alt=im?im.alt:'';
    lbc.textContent=z.getAttribute('data-cap')||'';lb.showModal();return;
  }
  if(e.target===lb||e.target.closest('#lbx'))lb.close();
});

/* Animación al desplazarse */
var rv=$$('.sec h2,.sub,.card,.g,.about>*,.form,.cbox,.ig');
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px'});
  rv.forEach(function(el){el.classList.add('rv');io.observe(el)});
}

/* Menú activo y botón volver arriba */
var top=$('#totop'),links=$$('.menu a[href^="#"]:not(.btn)');
var secs=links.map(function(a){return $(a.getAttribute('href'))});
function onScroll(){
  top.hidden=window.scrollY<600;
  var y=window.scrollY+120,cur=0;
  secs.forEach(function(s,i){if(s&&s.offsetTop<=y)cur=i});
  links.forEach(function(a,i){a.classList.toggle('on',i===cur)});
}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
top.addEventListener('click',function(){window.scrollTo({top:0})});

/* Formulario -> WhatsApp */
var form=$('#form'),ok=$('#ok'),foto=$('#foto');
function err(id,msg){
  var f=$('#'+id),e=$('#e-'+id);if(!f||!e)return;
  e.textContent=msg||'';
  if(msg){f.setAttribute('aria-invalid','true');f.setAttribute('aria-describedby','e-'+id)}else{f.removeAttribute('aria-invalid')}
}
['nombre','tel','prod','cant'].forEach(function(id){$('#'+id).addEventListener('input',function(){err(id,'')})});
form.addEventListener('submit',function(ev){
  ev.preventDefault();ok.textContent='';
  var v=function(id){return $('#'+id).value.trim()};
  var bad=null;
  function chk(id,cond,msg){if(cond){err(id,'');return}err(id,msg);if(!bad)bad=id}
  chk('nombre',v('nombre').length>=2,'Escribí tu nombre.');
  chk('tel',v('tel').replace(/\D/g,'').length>=8,'Escribí un teléfono válido, con código de área.');
  chk('prod',v('prod')!=='','Elegí qué producto necesitás.');
  chk('cant',parseInt(v('cant'),10)>=1,'La cantidad debe ser 1 o más.');
  if(bad){$('#'+bad).focus();return}
  var L=['Hola, vi su página de Zinguería Z-1 y quisiera solicitar un presupuesto.','',
    '*Nombre:* '+v('nombre'),'*Teléfono:* '+v('tel'),'*Producto:* '+v('prod'),
    '*Medidas:* '+(v('med')||'A definir'),'*Cantidad:* '+v('cant'),
    '*Descripción:* '+(v('desc')||'Sin detalles')];
  if(foto.files&&foto.files[0])L.push('*Foto:* Te la envío en este chat.');
  window.open(wa(L.join('\n')),'_blank','noopener');
  ok.textContent='Se abrió WhatsApp con tu consulta. Tocá "Enviar" allí para completarla.'+(foto.files&&foto.files[0]?' No olvides adjuntar la foto en el chat.':'');
});
})();
