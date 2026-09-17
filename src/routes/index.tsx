import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

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

  const { data: patients = [] } = useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: refills = [] } = useQuery({
    queryKey: ["refills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("refills").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: installations = [] } = useQuery({
    queryKey: ["installations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("installations").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: removals = [] } = useQuery({
    queryKey: ["removals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("removals").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: occurrences = [] } = useQuery({
    queryKey: ["occurrences"],
    queryFn: async () => {
      const { data, error } = await supabase.from("occurrences").select("*").eq("situacao", "aberta");
      if (error) throw error;
      return data;
    },
  });

  const nomePaciente = new Map(patients.map((p) => [p.id, p.nome]));

  const ativos = patients.filter((p) => p.status === "oxigenio_ativo").length;
  const recargasAtrasadas = refills.filter(
    (r) => r.status !== "realizada" && r.status !== "cancelada" && (r.data_prevista ?? "") < hoje,
  );
  const recargasVencendo = patients.filter(
    (p) => p.proxima_recarga && p.proxima_recarga >= hoje && p.proxima_recarga <= addDaysISO(hoje, 7),
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
      .map((r) => ({ id: r.id, tipo: "Recarga", paciente: nomePaciente.get(r.paciente_id) ?? "—" })),
    ...installations
      .filter((i) => i.data_agendada === hoje)
      .map((i) => ({
        id: i.id,
        tipo: "Implantação",
        paciente: nomePaciente.get(i.paciente_id) ?? "—",
      })),
    ...removals
      .filter((r) => r.data_agendada === hoje)
      .map((r) => ({ id: r.id, tipo: "Retirada", paciente: nomePaciente.get(r.paciente_id) ?? "—" })),
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Secretaria Municipal de Saúde de Botucatu"
        title="Painel operacional"
        description="Visão geral da oxigenoterapia domiciliar, pendências críticas e agenda do dia."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pacientes ativos" value={ativos} hint={`${patients.length} cadastrados`} />
        <StatCard
          label="Recargas atrasadas"
          value={recargasAtrasadas.length}
          hint="Prazo previsto vencido"
          tone="critical"
        />
        <StatCard
          label="Recargas nos próximos 7 dias"
          value={recargasVencendo.length}
          hint="Programação preventiva"
          tone="warning"
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
          <h2 className="font-display text-base font-bold">⚠️ Atenção — pendências</h2>
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
          <h2 className="font-display text-base font-bold">📅 Atividades de hoje</h2>
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
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] tracking-wide text-muted-foreground uppercase">
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
