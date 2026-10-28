import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  RefreshCw,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, todayISO } from "@/lib/domain";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel operacional — Oxigenoterapia Domiciliar Botucatu" },
      {
        name: "description",
        content:
          "Indicadores, pendências e atividades do dia da oxigenoterapia domiciliar da Secretaria Municipal de Saúde de Botucatu.",
      },
      { property: "og:title", content: "Painel operacional da oxigenoterapia domiciliar" },
      {
        property: "og:description",
        content: "Acompanhe pacientes, recargas, implantações e retiradas em um só lugar.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const hoje = todayISO();

  const patientsQuery = useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const refillsQuery = useQuery({
    queryKey: ["refills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("refills").select("*");
      if (error) throw error;
      return data;
    },
  });

  const installationsQuery = useQuery({
    queryKey: ["installations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("installations").select("*");
      if (error) throw error;
      return data;
    },
  });

  const removalsQuery = useQuery({
    queryKey: ["removals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("removals").select("*");
      if (error) throw error;
      return data;
    },
  });

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*");
      if (error) throw error;
      return data;
    },
  });

  const occurrencesQuery = useQuery({
    queryKey: ["occurrences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("occurrences")
        .select("*")
        .eq("situacao", "aberta");
      if (error) throw error;
      return data;
    },
  });

  const { data: patients = [] } = patientsQuery;
  const { data: refills = [] } = refillsQuery;
  const { data: installations = [] } = installationsQuery;
  const { data: removals = [] } = removalsQuery;
  const { data: documents = [] } = documentsQuery;
  const { data: occurrences = [] } = occurrencesQuery;
  const queries = [
    patientsQuery,
    refillsQuery,
    installationsQuery,
    removalsQuery,
    documentsQuery,
    occurrencesQuery,
  ];
  if (queries.some((query) => query.isPending))
    return (
      <AppShell>
        <PageHeader title="Visão geral" description="Carregando os dados da operação…" />
        <div role="status" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-lg border bg-white" />
          ))}
        </div>
      </AppShell>
    );
  if (queries.some((query) => query.isError))
    return (
      <AppShell>
        <PageHeader title="Visão geral" />
        <section role="alert" className="rounded-lg border border-red-200 bg-white p-6">
          <AlertCircle className="mb-3 size-6 text-red-600" />
          <h2 className="text-lg font-semibold">Não foi possível carregar o painel</h2>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Algumas consultas ao banco falharam. Verifique sua conexão e tente novamente. Os
            indicadores não serão exibidos até os dados serem carregados.
          </p>
          <button
            type="button"
            onClick={() => void Promise.allSettled(queries.map((query) => query.refetch()))}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            <RefreshCw className="size-4" />
            Tentar novamente
          </button>
        </section>
      </AppShell>
    );

  const nomePaciente = new Map(patients.map((p) => [p.id, p.nome]));

  const ativos = patients.filter((p) => p.status === "oxigenio_ativo").length;
  const recargasAtrasadas = refills.filter(
    (r) =>
      r.status !== "realizada" &&
      r.status !== "cancelada" &&
      !!r.data_prevista &&
      r.data_prevista < hoje,
  );
  const recargasVencendo = patients.filter(
    (p) =>
      p.proxima_recarga && p.proxima_recarga >= hoje && p.proxima_recarga <= addDaysISO(hoje, 7),
  );
  const implantacoesPendentes = installations.filter(
    (i) => i.status === "solicitada" || i.status === "agendada",
  );
  const retiradasPendentes = removals.filter(
    (r) => r.status === "solicitada" || r.status === "agendada",
  );
  const documentosPendentes = documents.filter((d) => !d.conferido);
  const divergencias = documents.filter((d) => d.divergencia);

  const atividadesHoje = [
    ...refills
      .filter((r) => r.data_agendada === hoje)
      .map((r) => ({
        id: r.id,
        tipo: "Recarga",
        paciente: nomePaciente.get(r.paciente_id) ?? "—",
      })),
    ...installations
      .filter((i) => i.data_agendada === hoje)
      .map((i) => ({
        id: i.id,
        tipo: "Implantação",
        paciente: nomePaciente.get(i.paciente_id) ?? "—",
      })),
    ...removals
      .filter((r) => r.data_agendada === hoje)
      .map((r) => ({
        id: r.id,
        tipo: "Retirada",
        paciente: nomePaciente.get(r.paciente_id) ?? "—",
      })),
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Acompanhamento da operação"
        title="Visão geral"
        description="Pacientes, serviços e prioridades da oxigenoterapia domiciliar."
        actions={
          <Link
            to="/pacientes"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Users className="size-4" />
            Gerenciar pacientes
          </Link>
        }
      />

      {patients.length === 0 && (
        <section className="mb-6 flex flex-col gap-4 rounded-lg border border-blue-200 bg-blue-50/60 p-5 sm:flex-row sm:items-center">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-primary">
            <ClipboardCheck className="size-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold">Seu ambiente está pronto para começar</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ainda não há pacientes cadastrados neste banco. Os registros da versão anterior não
              foram importados.
            </p>
          </div>
          <Link
            to="/pacientes"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary"
          >
            Cadastrar paciente
            <ArrowRight className="size-4" />
          </Link>
        </section>
      )}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Pacientes ativos" value={ativos} hint={`${patients.length} cadastrados`} />
        <StatCard
          label="Recargas atrasadas"
          value={recargasAtrasadas.length}
          hint="Prazo previsto vencido"
          tone={recargasAtrasadas.length ? "critical" : "neutral"}
        />
        <StatCard
          label="Recargas nos próximos 7 dias"
          value={recargasVencendo.length}
          hint="Programação preventiva"
          tone={recargasVencendo.length ? "warning" : "neutral"}
        />
        <StatCard
          label="Documentos a conferir"
          value={documentosPendentes.length}
          hint={`${divergencias.length} com divergência`}
          tone={divergencias.length ? "critical" : "scheduled"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="glass-panel p-5">
          <h2 className="font-display text-base font-bold">Pendências da operação</h2>
          <div className="mt-3 space-y-2">
            <PendenciaLinha
              titulo="Recargas atrasadas"
              quantidade={recargasAtrasadas.length}
              to="/recargas"
              tone="critical"
            />
            <PendenciaLinha
              titulo="Implantações aguardando execução"
              quantidade={implantacoesPendentes.length}
              to="/implantacoes"
              tone="warning"
            />
            <PendenciaLinha
              titulo="Retiradas aguardando execução"
              quantidade={retiradasPendentes.length}
              to="/retiradas"
              tone="warning"
            />
            <PendenciaLinha
              titulo="Documentos sem conferência"
              quantidade={documentosPendentes.length}
              to="/documentos"
              tone="scheduled"
            />
            <PendenciaLinha
              titulo="Ocorrências em aberto"
              quantidade={occurrences.length}
              to="/pendencias"
              tone="critical"
            />
          </div>
        </section>

        <section className="glass-panel p-5">
          <h2 className="font-display text-base font-bold">Agenda de hoje</h2>
          <p className="text-xs text-muted-foreground">{formatDate(hoje)}</p>
          <div className="mt-3 space-y-2">
            {atividadesHoje.map((a) => (
              <div
                key={`${a.tipo}-${a.id}`}
                className="glass-soft flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              >
                <span className="text-sm font-medium">{a.paciente}</span>
                <StatusBadge tone="scheduled">{a.tipo}</StatusBadge>
              </div>
            ))}
            {atividadesHoje.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma atividade agendada para hoje. Confira a agenda da semana.
              </p>
            ) : null}
          </div>
          <Link
            to="/agenda"
            className="mt-4 inline-block text-xs font-semibold text-primary hover:underline"
          >
            Abrir agenda completa →
          </Link>
        </section>
      </div>

      <section className="glass-panel mt-4 p-5">
        <h2 className="font-display text-base font-bold">Recargas mais próximas</h2>
        {!patients.some((p) => p.proxima_recarga) && (
          <p className="py-8 text-center text-sm leading-6 text-muted-foreground">
            Nenhuma próxima recarga registrada. As programações aparecerão aqui após o cadastro.
          </p>
        )}
        <div
          className={patients.some((p) => p.proxima_recarga) ? "mt-3 overflow-x-auto" : "hidden"}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                <th className="px-3 py-2 font-semibold">Paciente</th>
                <th className="px-3 py-2 font-semibold">Bairro</th>
                <th className="px-3 py-2 font-semibold">Equipamento</th>
                <th className="px-3 py-2 font-semibold">Próxima recarga</th>
              </tr>
            </thead>
            <tbody>
              {patients
                .filter((p) => p.proxima_recarga)
                .sort((a, b) => (a.proxima_recarga ?? "").localeCompare(b.proxima_recarga ?? ""))
                .slice(0, 8)
                .map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        to="/pacientes/$id"
                        params={{ id: p.id }}
                        className="font-medium text-primary hover:underline"
                      >
                        {p.nome}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{p.bairro ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {p.numero_equipamento ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {formatDate(p.proxima_recarga)}
                      {(p.proxima_recarga ?? "") < hoje ? (
                        <span className="ml-2 text-critical">atrasada</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function PendenciaLinha({
  titulo,
  quantidade,
  to,
  tone,
}: {
  titulo: string;
  quantidade: number;
  to: "/recargas" | "/implantacoes" | "/retiradas" | "/documentos" | "/pendencias";
  tone: "critical" | "warning" | "scheduled";
}) {
  return (
    <Link
      to={to}
      className="glass-soft flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-background/70"
    >
      <span className="text-sm font-medium">{titulo}</span>
      <StatusBadge tone={quantidade > 0 ? tone : "success"}>{quantidade}</StatusBadge>
    </Link>
  );
}

function addDaysISO(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
