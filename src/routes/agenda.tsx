import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, todayISO } from "@/lib/domain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda de atendimentos — Oxigenoterapia Botucatu" },
      {
        name: "description",
        content:
          "Agenda diária, semanal e mensal de recargas, implantações, retiradas e conferências de documentos.",
      },
      { property: "og:title", content: "Agenda de atendimentos" },
      {
        property: "og:description",
        content: "Programação de recargas, implantações e retiradas domiciliares.",
      },
    ],
  }),
  component: Agenda,
});

type Evento = {
  id: string;
  data: string;
  tipo: "Recarga" | "Implantação" | "Retirada" | "Conferência";
  paciente: string;
  pacienteId: string;
};

const tons: Record<Evento["tipo"], "scheduled" | "warning" | "critical" | "success"> = {
  Recarga: "scheduled",
  Implantação: "success",
  Retirada: "warning",
  Conferência: "critical",
};

function Agenda() {
  const [visao, setVisao] = useState<"dia" | "semana" | "mes">("semana");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | Evento["tipo"]>("todos");
  const hoje = todayISO();

  const { data: patients = [] } = useQuery({
    queryKey: ["pacientes-basico"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, nome").order("nome");
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

  const nome = useMemo(() => new Map(patients.map((p) => [p.id, p.nome])), [patients]);

  const eventos: Evento[] = useMemo(() => {
    const lista: Evento[] = [];
    refills.forEach((r) => {
      const data = r.data_agendada ?? r.data_prevista;
      if (data)
        lista.push({
          id: r.id,
          data,
          tipo: "Recarga",
          paciente: nome.get(r.paciente_id) ?? "—",
          pacienteId: r.paciente_id,
        });
    });
    installations.forEach((i) => {
      const data = i.data_agendada ?? i.data_prevista;
      if (data)
        lista.push({
          id: i.id,
          data,
          tipo: "Implantação",
          paciente: nome.get(i.paciente_id) ?? "—",
          pacienteId: i.paciente_id,
        });
    });
    removals.forEach((r) => {
      const data = r.data_agendada ?? r.data_prevista;
      if (data)
        lista.push({
          id: r.id,
          data,
          tipo: "Retirada",
          paciente: nome.get(r.paciente_id) ?? "—",
          pacienteId: r.paciente_id,
        });
    });
    documents
      .filter((d) => !d.conferido && d.data && d.paciente_id)
      .forEach((d) => {
        lista.push({
          id: d.id,
          data: d.data as string,
          tipo: "Conferência",
          paciente: nome.get(d.paciente_id as string) ?? "—",
          pacienteId: d.paciente_id as string,
        });
      });
    return lista.sort((a, b) => a.data.localeCompare(b.data));
  }, [refills, installations, removals, documents, nome]);

  const limite =
    visao === "dia" ? shift(hoje, 0) : visao === "semana" ? shift(hoje, 7) : shift(hoje, 30);
  const inicio = visao === "dia" ? hoje : shift(hoje, -7);

  const visiveis = eventos.filter((e) => {
    if (tipoFiltro !== "todos" && e.tipo !== tipoFiltro) return false;
    return e.data >= inicio && e.data <= limite;
  });

  const porDia = visiveis.reduce<Record<string, Evento[]>>((acc, evento) => {
    (acc[evento.data] ??= []).push(evento);
    return acc;
  }, {});

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operação"
        title="Agenda"
        description="Recargas, implantações, retiradas e conferências organizadas por data."
        actions={
          <div className="flex gap-1 rounded-lg border bg-background/60 p-1">
            {(["dia", "semana", "mes"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setVisao(item)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold capitalize",
                  visao === item ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {item === "mes" ? "mês" : item}
              </button>
            ))}
          </div>
        }
      />

      <div className="glass-panel mb-4 flex flex-wrap gap-2 p-3">
        {(["todos", "Recarga", "Implantação", "Retirada", "Conferência"] as const).map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setTipoFiltro(tipo)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold",
              tipoFiltro === tipo ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            {tipo === "todos" ? "Todas as categorias" : tipo}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {Object.entries(porDia).map(([dia, lista]) => (
          <section key={dia} className="glass-panel p-4">
            <h2 className="font-display text-sm font-bold">
              {formatDate(dia)}
              {dia === hoje ? <span className="ml-2 text-xs text-primary">hoje</span> : null}
            </h2>
            <div className="mt-2 space-y-2">
              {lista.map((evento) => (
                <Link
                  key={`${evento.tipo}-${evento.id}`}
                  to="/pacientes/$id"
                  params={{ id: evento.pacienteId }}
                  className="glass-soft flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 hover:bg-background/70"
                >
                  <span className="text-sm font-medium">{evento.paciente}</span>
                  <StatusBadge tone={tons[evento.tipo]}>{evento.tipo}</StatusBadge>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {visiveis.length === 0 ? (
          <p className="glass-panel p-6 text-center text-sm text-muted-foreground">
            Nenhum compromisso neste período.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}

function shift(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
