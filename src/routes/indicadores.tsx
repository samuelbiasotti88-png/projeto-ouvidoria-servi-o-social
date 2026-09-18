import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { patientStatusLabels, todayISO } from "@/lib/domain";

export const Route = createFileRoute("/indicadores")({
  head: () => ({
    meta: [
      { title: "Indicadores do serviço — Oxigenoterapia Botucatu" },
      {
        name: "description",
        content:
          "Indicadores de desempenho da oxigenoterapia domiciliar: execução de recargas, prazos e distribuição por bairro.",
      },
      { property: "og:title", content: "Indicadores do serviço" },
      {
        property: "og:description",
        content: "Desempenho das recargas, implantações e retiradas no período selecionado.",
      },
    ],
  }),
  component: Indicadores,
});

function Indicadores() {
  const hoje = todayISO();
  const [dias, setDias] = useState(90);
  const inicio = shift(hoje, -dias);

  const { data: patients = [] } = useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*");
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

  const noPeriodo = refills.filter((r) => (r.data_prevista ?? r.data_solicitacao ?? "") >= inicio);
  const realizadas = noPeriodo.filter((r) => r.status === "realizada");
  const noPrazo = realizadas.filter(
    (r) => !r.data_prevista || (r.data_realizada ?? "") <= r.data_prevista,
  );
  const taxaExecucao = noPeriodo.length
    ? Math.round((realizadas.length / noPeriodo.length) * 100)
    : 0;
  const taxaPrazo = realizadas.length ? Math.round((noPrazo.length / realizadas.length) * 100) : 0;

  const porStatus = Object.entries(
    patients.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const porBairro = Object.entries(
    patients.reduce<Record<string, number>>((acc, p) => {
      const bairro = p.bairro ?? "Não informado";
      acc[bairro] = (acc[bairro] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxStatus = Math.max(1, ...porStatus.map(([, valor]) => valor));
  const maxBairro = Math.max(1, ...porBairro.map(([, valor]) => valor));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Gestão"
        title="Indicadores"
        description="Desempenho operacional do serviço no período selecionado."
        actions={
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="rounded-lg border bg-background/70 px-3 py-2 text-sm"
          >
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={180}>Últimos 180 dias</option>
            <option value={365}>Últimos 12 meses</option>
          </select>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recargas no período" value={noPeriodo.length} hint="previstas ou solicitadas" />
        <StatCard label="Recargas realizadas" value={realizadas.length} tone="success" />
        <StatCard label="Taxa de execução" value={`${taxaExecucao}%`} tone="scheduled" />
        <StatCard label="Realizadas no prazo" value={`${taxaPrazo}%`} tone={taxaPrazo >= 80 ? "success" : "warning"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="glass-panel p-5">
          <h2 className="font-display text-sm font-bold">Pacientes por status</h2>
          <div className="mt-3 space-y-2">
            {porStatus.map(([status, valor]) => (
              <div key={status}>
                <div className="flex justify-between text-xs">
                  <span>{patientStatusLabels[status as keyof typeof patientStatusLabels] ?? status}</span>
                  <span className="font-semibold">{valor}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(valor / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel p-5">
          <h2 className="font-display text-sm font-bold">Pacientes por bairro</h2>
          <div className="mt-3 space-y-2">
            {porBairro.map(([bairro, valor]) => (
              <div key={bairro}>
                <div className="flex justify-between text-xs">
                  <span>{bairro}</span>
                  <span className="font-semibold">{valor}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${(valor / maxBairro) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function shift(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
