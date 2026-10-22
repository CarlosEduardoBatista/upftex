# UPFTeX

Customização institucional do **Overleaf Community Edition (v6.3.0)** para a
Universidade de Passo Fundo (UPF), desenvolvida como Trabalho Final de Curso
do curso de Ciência da Computação.

O UPFTeX é um ambiente colaborativo de escrita acadêmica em LaTeX, executado
na infraestrutura da própria instituição. Preserva os recursos de edição,
colaboração e compilação do Overleaf e acrescenta dois elementos ausentes na
versão gratuita e necessários ao uso institucional: **autenticação integrada
às contas Google Workspace da UPF** e **identidade visual da universidade**.

## Abordagem

Em vez de modificar o código-fonte do monorepositório do Overleaf, adota-se
uma arquitetura em camadas (*overlay*): uma imagem Docker personalizada é
construída a partir da imagem oficial `sharelatex/sharelatex:6.3.0`,
sobrepondo apenas os arquivos modificados e adicionados. Isso mantém as
customizações isoladas, reduz o impacto das alterações e facilita a
atualização para novas versões da plataforma.

## Estrutura do repositório

```
upftex/
├── Dockerfile                 # imagem UPFTeX (overlay sobre o CE 6.3.0)
├── overlay/                   # arquivos sobrepostos à imagem oficial
│   └── services/web/
│       ├── modules/oidc-upf/  # módulo de autenticação OIDC
│       ├── public/            # assets de branding
│       └── app/views/         # templates customizados (login, layout base)
├── LICENSE                    # AGPLv3
└── README.md
```

O módulo `oidc-upf` organiza-se no padrão do Overleaf:

```
modules/oidc-upf/
├── index.mjs                               # declaração do módulo e hooks
└── app/src/
    ├── OIDCRouter.mjs                       # rotas /oidc/login e callback
    ├── OIDCAuthenticationController.mjs     # fluxo do passport
    ├── OIDCModuleManager.mjs                # configuração da estratégia Google
    └── OIDCAuthenticationManager.mjs        # resolução/criação de usuário + domínio
```

## Pré-requisitos

- Docker e Docker Compose
- [Overleaf Toolkit](https://github.com/overleaf/toolkit)
- Credenciais OAuth 2.0 de um projeto no Google Cloud Console

## Construção da imagem

```bash
git clone https://github.com/CarlosEduardoBatista/upftex.git
cd upftex
docker build -t upftex:6.3.0 .
```

> O build inclui a instalação do TeX Live completo (`scheme-full`) e a
> regeneração de índices, mapas de fonte e formatos — por isso é demorado na
> primeira execução. Builds seguintes reaproveitam o cache dessa camada.

## Implantação com o Overleaf Toolkit

1. Instale o Overleaf Toolkit e, em `config/`, aponte a instância para a
   imagem personalizada criando `config/docker-compose.override.yml`:

   ```yaml
   services:
     sharelatex:
       image: upftex:6.3.0
       environment:
         OVERLEAF_SITE_URL: http://SEU-ENDERECO
         OVERLEAF_OIDC_CLIENT_ID: <client-id-do-google>
         OVERLEAF_OIDC_CLIENT_SECRET: <client-secret-do-google>
         OVERLEAF_OIDC_ALLOWED_DOMAIN: upf.br
         OVERLEAF_HEADER_IMAGE_URL: /img/upf/upf-simbolo-navbar.png
         OVERLEAF_INVITE_TOKEN_SECRET: <valor-aleatorio-estavel>
   ```

2. Defina `6.3.0` em `config/version` e `MONGO_VERSION=8.0` em
   `config/overleaf.rc`.

3. Suba a instância:

   ```bash
   bin/up
   ```

### Passos manuais necessários

O Overleaf CE 6.3.0 exige dois ajustes que **não** são automáticos ao subir
pela primeira vez com um banco novo:

- **Segredo obrigatório:** gere um valor estável para
  `OVERLEAF_INVITE_TOKEN_SECRET` e inclua-o na configuração (ver acima).
  Um valor pode ser gerado com `openssl rand -base64 32`. Ele deve
  permanecer estável entre reinicializações.

- **Replica set do MongoDB:** o Overleaf requer o MongoDB em modo *replica
  set*. Com um volume de dados novo, inicialize-o uma vez:

  ```bash
  docker exec mongo mongosh --quiet --eval \
    "rs.initiate({_id: 'overleaf', members: [{_id: 0, host: 'mongo:27017'}]})"
  ```

## Configuração do SSO (Google Cloud Console)

1. Crie um *OAuth Client ID* do tipo **Web application**.
2. Em **Authorized redirect URIs**, adicione o endereço de callback
   correspondente a cada ambiente — por exemplo:
   - `http://localhost/oidc/login/callback` (desenvolvimento)
   - `https://upftex.upf.br/oidc/login/callback` (produção)
3. O valor de `OVERLEAF_SITE_URL` deve coincidir exatamente com o host do
   redirect URI cadastrado, pois a aplicação monta o callback a partir dele.

> O Google exige que o redirect URI use um domínio público válido
> (exceção para `localhost`). Em uma VM de rede interna, isso requer um
> domínio institucional resolvível internamente (ex.: `upftex.upf.br`), ou,
> para testes, um serviço de resolução por IP.

## Licença

Este projeto deriva do Overleaf Community Edition e é distribuído sob a
licença **GNU Affero General Public License v3 (AGPLv3)**. Conforme a
cláusula de uso em rede, o código-fonte das modificações é disponibilizado
aos usuários.

## Créditos

- [Overleaf Community Edition](https://github.com/overleaf/overleaf) — base do projeto.
- [Overleaf Extended CE](https://github.com/yu-i-i/overleaf-cep) — referência
  para a implementação do suporte a OIDC.
