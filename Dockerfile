FROM sharelatex/sharelatex:6.3.0

LABEL maintainer="Carlos Eduardo Rosa Batista"
LABEL description="UPFTeX - Overleaf CE customizado para a Universidade de Passo Fundo"

RUN tlmgr update --self \
 && tlmgr --no-execute-actions install scheme-full \
 && tlmgr path add

RUN sed -i "s|moduleImportSequence: \[|oauthProviders: { 'oidc-upf': { name: 'UPF (Google)' } },\n  moduleImportSequence: ['oidc-upf',|" /overleaf/services/web/config/settings.defaults.js \
 && grep -q "moduleImportSequence: \['oidc-upf'," /overleaf/services/web/config/settings.defaults.js \
 && grep -q "oauthProviders: { 'oidc-upf'" /overleaf/services/web/config/settings.defaults.js

COPY overlay/services/web/public/img/upf /overleaf/services/web/public/img/upf

COPY overlay/services/web/public/favicon.svg overlay/services/web/public/favicon.ico overlay/services/web/public/favicon-16x16.png overlay/services/web/public/favicon-32x32.png overlay/services/web/public/apple-touch-icon.png /overleaf/services/web/public/

COPY overlay/services/web/modules/oidc-upf /overleaf/services/web/modules/oidc-upf

RUN mkdir -p /tmp/oidc-build \
 && cd /tmp/oidc-build \
 && npm init -y >/dev/null 2>&1 \
 && npm install passport-openidconnect --legacy-peer-deps >/dev/null 2>&1 \
 && npm install esbuild >/dev/null 2>&1 \
 && printf "import { Strategy } from 'passport-openidconnect'\nexport { Strategy }\n" > entry.mjs \
 && npx esbuild entry.mjs --bundle --platform=node --format=esm \
      --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);" \
      --outfile=/overleaf/services/web/modules/oidc-upf/app/src/vendor/passport-openidconnect.bundle.mjs \
 && test -f /overleaf/services/web/modules/oidc-upf/app/src/vendor/passport-openidconnect.bundle.mjs \
 && rm -rf /tmp/oidc-build

COPY overlay/services/web/app/views/user/login.pug /overleaf/services/web/app/views/user/login.pug
