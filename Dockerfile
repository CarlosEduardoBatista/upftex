# UPFTeX - Ambiente Colaborativo de Escrita Academica (UPF)
# Imagem customizada baseada no Overleaf Community Edition, versao fixada em 6.3.0.
FROM sharelatex/sharelatex:6.3.0

LABEL maintainer="Carlos Eduardo Rosa Batista"
LABEL description="UPFTeX - Overleaf CE customizado para a Universidade de Passo Fundo"

# --- Branding (Nivel 2) entra aqui depois ---

# --- SSO/OIDC: dependencia de autenticacao ---
# O monorepo do Overleaf usa workspaces (dependencias "workspace:*"), o que impede
# um "npm install" direto dentro de services/web. Solucao: instalar a biblioteca de
# forma isolada num diretorio temporario e copiar o resultado para o node_modules
# do servico web, onde o Node consegue resolve-la em tempo de execucao.
RUN mkdir -p /tmp/oidc-dep \
 && cd /tmp/oidc-dep \
 && npm init -y >/dev/null 2>&1 \
 && npm install passport-openidconnect --legacy-peer-deps \
 && mkdir -p /overleaf/services/web/node_modules \
 && cp -r /tmp/oidc-dep/node_modules/. /overleaf/services/web/node_modules/ \
 && rm -rf /tmp/oidc-dep
