// Gera os PNGs do ícone a partir dos SVGs oficiais em public/logo/ (guia: LOGO-PULPITO.md).
// Uso: node scripts/gerar-icones.cjs   (precisa do Playwright instalado na máquina)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pub = path.join(__dirname, '..', 'public');
const ALVOS = [
  ['icone-app.svg', 'icone-192.png', 192], ['icone-app.svg', 'icone-512.png', 512], ['icone-app.svg', 'icone-48.png', 48],
  ['icone-app-quadrado.svg', 'icone-512-mascara.png', 512], ['icone-app-quadrado.svg', 'icone-192-mascara.png', 192], ['icone-app-quadrado.svg', 'icone-180.png', 180],
];
(async () => {
  const b = await chromium.launch();
  for (const [origem, destino, tam] of ALVOS) {
    const svg = fs.readFileSync(path.join(pub, 'logo', origem), 'utf8').replace('<svg ', `<svg width="${tam}" height="${tam}" `);
    const p = await b.newPage({ viewport: { width: tam, height: tam } });
    await p.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
    await p.screenshot({ path: path.join(pub, destino), omitBackground: true });
    await p.close();
  }
  await b.close();
  console.log('ícones gerados:', ALVOS.map((a) => a[1]).join(', '));
})();
