/**
 * Spoločná navigácia – Miloslavov komunitný sprievodca
 * Stačí pridať: <script src="[cesta]/assets/nav.js"></script>
 * Aktívny odkaz sa deteguje automaticky podľa URL.
 */
(function () {
  // Odvodíme root URL z absolútnej adresy tohto skriptu
  const src = (document.currentScript || {}).src || '';
  const rootUrl = src ? src.replace(/assets\/nav\.js(\?.*)?$/, '') : '/';

  const navItems = [
    { slug: 'sluzby',       emoji: '🔧', label: 'Služby',           enabled: true  },
    { slug: 'ako-vybavim',  emoji: '📋', label: 'Ako vybavím',      enabled: false },
    { slug: 'volny-cas',    emoji: '🚴', label: 'Voľný čas',        enabled: false },
    { slug: 'doprava',      emoji: '🚌', label: 'Doprava',          enabled: false },
    { slug: 'odpad',        emoji: '🗑️', label: 'Odpad',            enabled: false },
    { slug: 'skoly',        emoji: '🏫', label: 'Školy',            enabled: false },
  ];

  const currentPath = window.location.pathname;

  const linksHtml = navItems.map(function (item) {
    const href = rootUrl + item.slug + '/';
    const isActive = currentPath.indexOf('/' + item.slug + '/') !== -1;
    const cls = [isActive ? 'active' : '', !item.enabled ? 'disabled' : ''].filter(Boolean).join(' ');
    return '<a href="' + href + '"' + (cls ? ' class="' + cls + '"' : '') + '>'
      + item.emoji + '\u00a0' + item.label + '</a>';
  }).join('');

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.innerHTML =
    '<nav class="nav-inner" aria-label="Hlavné menu">' +
      '<div class="nav-brand">' +
        '<a href="' + rootUrl + '" style="color:inherit;text-decoration:none">🏘️\u00a0Miloslavov</a>' +
        ' <span class="badge">komunitný sprievodca</span>' +
      '</div>' +
      '<div class="nav-sep"></div>' +
      '<div class="nav-links">' + linksHtml + '</div>' +
    '</nav>';

  // Vložíme nav priamo pred tento <script> tag
  const script = document.currentScript;
  if (script && script.parentNode) {
    script.parentNode.insertBefore(wrapper, script);
  } else {
    document.body.insertBefore(wrapper, document.body.firstChild);
  }
}());

