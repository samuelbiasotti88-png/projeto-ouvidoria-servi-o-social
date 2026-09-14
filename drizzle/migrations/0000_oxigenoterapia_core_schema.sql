-- ENUMS
create type public.app_role as enum ('admin','gestor','operador','consulta','auditor');
create type public.patient_status as enum (
  'solicitacao_recebida','em_analise','aguardando_implantacao','implantacao_agendada',
  'implantacao_realizada','oxigenio_ativo','recarga_solicitada','recarga_agendada',
  'recarga_realizada','retirada_solicitada','retirada_agendada','retirada_realizada',
  'encerrado','cancelado');
create type public.service_status as enum ('solicitada','agendada','realizada','nao_realizada','cancelada','atrasada');
create type public.equipment_status as enum ('disponivel','em_uso','em_manutencao','retirado','inativo');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  cargo text default '',
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles legiveis por autenticados" on public.profiles for select to authenticated using (true);
create policy "usuario atualiza proprio perfil" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "usuario cria proprio perfil" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.pode_editar(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','operador'))
$$;

create policy "usuario ve seus papeis" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'auditor') or public.has_role(auth.uid(),'gestor'));

-- novo usuario -> profile + papel (primeiro usuario vira admin)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role app_role;
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;

  if not exists (select 1 from public.user_roles where role = 'admin') then
    v_role := 'admin';
  else
    v_role := 'consulta';
  end if;

  insert into public.user_roles (user_id, role) values (new.id, v_role)
  on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- EMPRESAS
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  contato text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.companies to authenticated;
grant all on public.companies to service_role;
alter table public.companies enable row level security;
create policy "empresas leitura" on public.companies for select to authenticated using (true);
create policy "empresas escrita" on public.companies for all to authenticated
  using (public.pode_editar(auth.uid())) with check (public.pode_editar(auth.uid()));

-- PACIENTES
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text,
  cartao_sus text,
  data_nascimento date,
  telefone text,
  telefone_alt text,
  responsavel text,
  parentesco text,
  obs_admin text,
  cep text, logradouro text, numero text, complemento text,
  bairro text, cidade text default 'Botucatu', estado text default 'SP', referencia text,
  tipo_equipamento text,
  numero_equipamento text,
  tipo_oxigenio text,
  data_solicitacao date,
  data_autorizacao date,
  data_prevista_implantacao date,
  data_implantacao date,
  empresa_id uuid references public.companies(id),
  periodicidade_recarga_dias integer default 30,
  ultima_recarga date,
  proxima_recarga date,
  data_prevista_retirada date,
  data_retirada date,
  status patient_status not null default 'solicitacao_recebida',
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid, updated_by uuid
);
create index on public.patients (status);
create index on public.patients (cpf);
create index on public.patients (nome);
grant select, insert, update, delete on public.patients to authenticated;
grant all on public.patients to service_role;
alter table public.patients enable row level security;
create policy "pacientes leitura" on public.patients for select to authenticated using (true);
create policy "pacientes escrita" on public.patients for all to authenticated
  using (public.pode_editar(auth.uid())) with check (public.pode_editar(auth.uid()));

-- EQUIPAMENTOS
create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  tipo text not null,
  modelo text,
  empresa_id uuid references public.companies(id),
  status equipment_status not null default 'disponivel',
  paciente_id uuid references public.patients(id),
  data_entrega date,
  data_retirada date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.equipment to authenticated;
grant all on public.equipment to service_role;
alter table public.equipment enable row level security;
create policy "equipamentos leitura" on public.equipment for select to authenticated using (true);
create policy "equipamentos escrita" on public.equipment for all to authenticated
  using (public.pode_editar(auth.uid())) with check (public.pode_editar(auth.uid()));

-- IMPLANTACOES
create table public.installations (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.patients(id) on delete cascade,
  data_solicitacao date,
  data_prevista date,
  data_agendada date,
  data_realizada date,
  empresa_id uuid references public.companies(id),
  equipamento_id uuid references public.equipment(id),
  numero_equipamento text,
  responsavel text,
  status service_status not null default 'solicitada',
  motivo_nao_realizacao text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);
grant select, insert, update, delete on public.installations to authenticated;
grant all on public.installations to service_role;
alter table public.installations enable row level security;
create policy "implantacoes leitura" on public.installations for select to authenticated using (true);
create policy "implantacoes escrita" on public.installations for all to authenticated
  using (public.pode_editar(auth.uid())) with check (public.pode_editar(auth.uid()));

-- RECARGAS
create table public.refills (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.patients(id) on delete cascade,
  data_solicitacao date,
  data_prevista date,
  data_agendada date,
  data_realizada date,
  empresa_id uuid references public.companies(id),
  tipo_oxigenio text,
  quantidade numeric,
  numero_pedido text,
  numero_os text,
  numero_nota text,
  status service_status not null default 'solicitada',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);
create index on public.refills (paciente_id);
grant select, insert, update, delete on public.refills to authenticated;
grant all on public.refills to service_role;
alter table public.refills enable row level security;
create policy "recargas leitura" on public.refills for select to authenticated using (true);
create policy "recargas escrita" on public.refills for all to authenticated
  using (public.pode_editar(auth.uid())) with check (public.pode_editar(auth.uid()));

-- RETIRADAS
create table public.removals (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.patients(id) on delete cascade,
  data_solicitacao date,
  motivo text,
  data_prevista date,
  data_agendada date,
  data_realizada date,
  empresa_id uuid references public.companies(id),
  equipamento_id uuid references public.equipment(id),
  numero_equipamento text,
  responsavel text,
  status service_status not null default 'solicitada',
  motivo_nao_realizacao text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);
grant select, insert, update, delete on public.removals to authenticated;
grant all on public.removals to service_role;
alter table public.removals enable row level security;
create policy "retiradas leitura" on public.removals for select to authenticated using (true);
create policy "retiradas escrita" on public.removals for all to authenticated
  using (public.pode_editar(auth.uid())) with check (public.pode_editar(auth.uid()));

-- DOCUMENTOS / NOTAS
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references public.patients(id) on delete set null,
  refill_id uuid references public.refills(id) on delete set null,
  installation_id uuid references public.installations(id) on delete set null,
  removal_id uuid references public.removals(id) on delete set null,
  tipo text not null default 'nota_fiscal',
  numero text,
  data date,
  empresa_id uuid references public.companies(id),
  valor numeric,
  servico text,
  arquivo_path text,
  conferido boolean not null default false,
  divergencia text,
  divergencia_situacao text,
  dados_ia jsonb,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "documentos leitura" on public.documents for select to authenticated using (true);
create policy "documentos escrita" on public.documents for all to authenticated
  using (public.pode_editar(auth.uid())) with check (public.pode_editar(auth.uid()));

-- OCORRENCIAS
create table public.occurrences (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references public.patients(id) on delete cascade,
  titulo text not null,
  descricao text,
  gravidade text not null default 'media',
  situacao text not null default 'aberta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);
grant select, insert, update, delete on public.occurrences to authenticated;
grant all on public.occurrences to service_role;
alter table public.occurrences enable row level security;
create policy "ocorrencias leitura" on public.occurrences for select to authenticated using (true);
create policy "ocorrencias escrita" on public.occurrences for all to authenticated
  using (public.pode_editar(auth.uid())) with check (public.pode_editar(auth.uid()));

-- HISTORICO (timeline)
create table public.patient_history (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.patients(id) on delete cascade,
  evento text not null,
  detalhe text,
  categoria text default 'geral',
  ocorrido_em timestamptz not null default now(),
  usuario_id uuid
);
create index on public.patient_history (paciente_id, ocorrido_em desc);
grant select, insert on public.patient_history to authenticated;
grant all on public.patient_history to service_role;
alter table public.patient_history enable row level security;
create policy "historico leitura" on public.patient_history for select to authenticated using (true);
create policy "historico insercao" on public.patient_history for insert to authenticated
  with check (public.pode_editar(auth.uid()));

-- AUDITORIA
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid,
  usuario_nome text,
  acao text not null,
  tabela text not null,
  registro_id uuid,
  valor_anterior jsonb,
  valor_novo jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_logs (created_at desc);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "auditoria leitura restrita" on public.audit_logs for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'auditor') or public.has_role(auth.uid(),'gestor'));
create policy "auditoria insercao" on public.audit_logs for insert to authenticated with check (true);

-- TRIGGER GENERICO DE AUDITORIA
create or replace function public.fn_audit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs (usuario_id, usuario_nome, acao, tabela, registro_id, valor_anterior, valor_novo)
  values (
    auth.uid(),
    (select nome from public.profiles where id = auth.uid()),
    lower(tg_op), tg_table_name,
    case when tg_op = 'DELETE' then (old.id) else (new.id) end,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger audit_patients after insert or update or delete on public.patients for each row execute function public.fn_audit();
create trigger audit_refills after insert or update or delete on public.refills for each row execute function public.fn_audit();
create trigger audit_installations after insert or update or delete on public.installations for each row execute function public.fn_audit();
create trigger audit_removals after insert or update or delete on public.removals for each row execute function public.fn_audit();
create trigger audit_equipment after insert or update or delete on public.equipment for each row execute function public.fn_audit();
create trigger audit_documents after insert or update or delete on public.documents for each row execute function public.fn_audit();

-- updated_at
create or replace function public.fn_touch()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end; $$;
create trigger touch_patients before update on public.patients for each row execute function public.fn_touch();
create trigger touch_refills before update on public.refills for each row execute function public.fn_touch();
create trigger touch_installations before update on public.installations for each row execute function public.fn_touch();
create trigger touch_removals before update on public.removals for each row execute function public.fn_touch();
create trigger touch_equipment before update on public.equipment for each row execute function public.fn_touch();
create trigger touch_documents before update on public.documents for each row execute function public.fn_touch();
