# Gestão de Oxigenoterapia Domiciliar — Botucatu

Aplicação de gestão para a Secretaria Municipal de Saúde de Botucatu. O código é preparado para execução independente em Node.js, com Supabase como banco e autenticação.

## Requisitos

- Node.js 22 ou superior
- pnpm
- Projeto Supabase configurado com as migrações deste repositório

## Desenvolvimento

```sh
pnpm install
cp .env.example .env
pnpm dev
```

Preencha `.env` com a URL e a chave publicável do projeto Supabase autorizado. Nunca coloque chaves secretas ou de serviço no navegador, no Git ou em variáveis com prefixo `VITE_`.

## Build e execução

```sh
pnpm build
pnpm start
```

O build usa TanStack Start e Nitro com saída para servidor Node. Na Railway, configure `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` no ambiente do serviço. A URL pública do app e os redirecionamentos de autenticação do Supabase também precisam ser configurados.

## Acesso e dados

Os dados reais de pacientes só devem ser carregados após autorização institucional, revisão das políticas de acesso e validação do fluxo de autenticação. Não importe dados de demonstração em produção.
