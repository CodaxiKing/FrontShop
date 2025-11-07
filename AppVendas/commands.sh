
#!/bin/bash
echo "🧹 Iniciando limpeza completa do projeto..."

# Remover pastas e arquivos do projeto
rm -rf node_modules
rm -rf android
rm -rf .expo
rm -rf .expo-shared
rm -rf dist
rm -rf web-build
rm -rf .turbo
rm -rf .cache
rm -rf .yarn
rm -f yarn.lock
rm -f package-lock.json
rm -f .pnp.*
rm -f .npmrc

# Limpar watchers do Watchman (usado em React Native)
watchman watch-del-all 2>/dev/null

# Limpar cache do npm e yarn (se existir)
npm cache clean --force 2>/dev/null
command -v yarn >/dev/null 2>&1 && yarn cache clean || true

sleep 3
# Mensagem final
echo " Limpeza concluída."
echo " Instalando novamente com NPM..."
npm install

sleep 3
# Inicializa o app
# npx expo start --clear - expo start --dev-client -c
echo " Iniciando expo start -c."
npx expo start --dev-client -c