# Gestão de Oxigenoterapia Domiciliar — Botucatu

Aplicação de gestão para a Secretaria Municipal de Saúde de Botucatu, preparada para executar fora do Lovable com TanStack Start, Nitro, Bun e Supabase.

## Requisitos

- Bun
- Projeto Supabase configurado com as migrações deste repositório

## Desenvolvimento local

```sh
bun install
cp .env.example .env
bun run dev
```

Preencha `.env` com a URL e a chave **publicável** do projeto Supabase. Chaves secretas ou de serviço nunca devem ser colocadas no navegador, no Git ou em variáveis com prefixo `VITE_`.

## Build e execução

```sh
bun run build
bun start
```

O build usa Nitro com saída para servidor Node compatível com Bun. No serviço Railway, configure as quatro variáveis de `.env.example`: as variáveis `VITE_*` precisam estar disponíveis durante o build para o cliente web conectar ao Supabase. Configure também a URL pública do app e os redirecionamentos de autenticação no Supabase.

## Acesso e dados

Os dados reais de pacientes só devem ser carregados após autorização institucional, revisão das políticas de acesso e validação do fluxo de autenticação. Não importe dados de demonstração em produção.
