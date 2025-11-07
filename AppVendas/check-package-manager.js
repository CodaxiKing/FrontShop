// AppVendas/check-package-manager.js

if (process.env.npm_execpath && process.env.npm_execpath.includes('yarn')) {
  console.error(`
❌ Este projeto não permite o uso de YARN.
👉 Use apenas NPM para instalar as dependências:
   npm install
`);
  process.exit(1);
}
