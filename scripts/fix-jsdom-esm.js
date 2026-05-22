const fs = require('fs');
const path = require('path');

const htmlEncodingPath = path.join(__dirname, '../node_modules/html-encoding-sniffer');
const jsdomHtmlEncodingPath = path.join(__dirname, '../node_modules/jsdom/node_modules/html-encoding-sniffer');

if (fs.existsSync(jsdomHtmlEncodingPath)) {
  const stats = fs.statSync(path.join(jsdomHtmlEncodingPath, 'package.json'));
  if (stats.isFile()) {
    const pkg = JSON.parse(fs.readFileSync(path.join(jsdomHtmlEncodingPath, 'package.json'), 'utf8'));
    if (pkg.version.startsWith('6.')) {
      console.log('[fix-jsdom-esm] Replacing jsdom\'s html-encoding-sniffer@6 with v5...');
      fs.rmSync(jsdomHtmlEncodingPath, { recursive: true, force: true });
      fs.cpSync(htmlEncodingPath, jsdomHtmlEncodingPath, { recursive: true });
      console.log('[fix-jsdom-esm] Done.');
    }
  }
}

const encodingLitePath = path.join(jsdomHtmlEncodingPath, 'node_modules/@exodus/bytes/encoding-lite.js');
const bytesMainPath = path.join(jsdomHtmlEncodingPath, 'node_modules/@exodus/bytes/package.json');
if (fs.existsSync(encodingLitePath) && fs.existsSync(bytesMainPath)) {
  const bytesPkg = JSON.parse(fs.readFileSync(bytesMainPath, 'utf8'));
  if (bytesPkg.exports && bytesPkg.exports['.']) {
    const mainExport = bytesPkg.exports['.'];
    if (mainExport && mainExport.import) {
      const esmMain = path.join(jsdomHtmlEncodingPath, 'node_modules/@exodus/bytes', mainExport.import);
      if (fs.existsSync(esmMain) && fs.existsSync(encodingLitePath)) {
        const cjsContent = `// CJS fallback - this file replaced by postinstall fix\n${fs.readFileSync(esmMain, 'utf8')}`;
        fs.writeFileSync(encodingLitePath, cjsContent);
        console.log('[fix-jsdom-esm] Patched encoding-lite.js to CJS');
      }
    }
  }
}