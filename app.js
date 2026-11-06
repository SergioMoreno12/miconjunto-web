(() => {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Barra superior con fondo al bajar y barra de progreso de lectura
  const barra = document.getElementById('barra');
  const progreso = document.querySelector('.progreso');
  const alDesplazar = () => {
    const y = window.scrollY;
    barra.classList.toggle('con-fondo', y > 20);
    const total = document.documentElement.scrollHeight - innerHeight;
    progreso.style.transform = `scaleX(${total > 0 ? y / total : 0})`;
  };
  addEventListener('scroll', alDesplazar, { passive: true });
  alDesplazar();

  // Menú en celulares
  const boton = document.querySelector('.menu-boton');
  const menu = document.getElementById('menu');
  const cerrar = () => { menu.classList.remove('abierto'); boton.setAttribute('aria-expanded', 'false'); };
  boton.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    boton.setAttribute('aria-expanded', String(abierto));
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrar));
  addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

  // Sección actual en el menú
  const enlaces = [...menu.querySelectorAll('a[href^="#"]:not(.boton)')];
  const secciones = enlaces.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const observadorSeccion = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) enlaces.forEach(a => a.classList.toggle('actual', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secciones.forEach(s => observadorSeccion.observe(s));

  // Aparecer al desplazar, escalonado dentro de cada grupo
  const revelar = document.querySelectorAll('.revelar');
  document.querySelectorAll('.funciones, .cifras-grid, .planes, .equipo, .linea-tiempo, .sellos, .ruta-grid').forEach(grupo => {
    [...grupo.children].forEach((h, i) => h.style.setProperty('--retraso', `${i * 0.08}s`));
  });
  const ver = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      e.target.querySelectorAll('[data-contar]').forEach(contar);
      ver.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  revelar.forEach(r => ver.observe(r));

  // Números que cuentan
  const formato = new Intl.NumberFormat('es-CO');
  function contar(el) {
    if (el.dataset.hecho) return;
    el.dataset.hecho = '1';
    const fin = Number(el.dataset.contar);
    const mas = el.dataset.mas || '';
    if (reducido) { el.textContent = formato.format(fin) + mas; return; }
    const dur = 1600, t0 = performance.now();
    const paso = t => {
      const p = Math.min(1, (t - t0) / dur);
      const v = Math.round(fin * (1 - Math.pow(1 - p, 4)));
      el.textContent = formato.format(v) + (p === 1 ? mas : '');
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }

  // Pestañas de las apps (con teclado: flechas, Inicio y Fin)
  const pestanas = [...document.querySelectorAll('.pestanas [role="tab"]')];
  const elegir = tab => {
    pestanas.forEach(t => {
      const sel = t === tab;
      t.setAttribute('aria-selected', String(sel));
      t.tabIndex = sel ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !sel;
      panel.classList.toggle('activo', sel);
    });
  };
  pestanas.forEach((t, i) => {
    t.style.setProperty('--c', t.dataset.color);
    t.addEventListener('click', () => elegir(t));
    t.addEventListener('keydown', e => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % pestanas.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + pestanas.length) % pestanas.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = pestanas.length - 1;
      if (j !== null) { e.preventDefault(); pestanas[j].focus(); elegir(pestanas[j]); }
    });
  });

  // Teléfono de la portada que se inclina con el mouse
  const tel = document.querySelector('.inclinable');
  if (tel && !reducido && matchMedia('(pointer: fine)').matches) {
    const zona = document.querySelector('.portada');
    zona.addEventListener('mousemove', e => {
      const r = zona.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tel.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
    });
    zona.addEventListener('mouseleave', () => { tel.style.transform = ''; });
  }

  // Frase de la portada que cambia
  const rot = document.getElementById('rotativo');
  const frases = ['en la palma de la mano.', 'sin grupos de WhatsApp.', 'más seguro y conectado.', 'al día y sin papeles.'];
  if (rot && !reducido) {
    let k = 0;
    setInterval(() => {
      k = (k + 1) % frases.length;
      rot.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 280, easing: 'ease-in' })
        .onfinish = () => {
          rot.textContent = frases[k];
          rot.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 380, easing: 'ease-out' });
        };
    }, 3200);
  }
})();
