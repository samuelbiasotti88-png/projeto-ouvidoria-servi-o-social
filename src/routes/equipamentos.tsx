import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, formatDate } from "@/lib/domain";

export const Route = createFileRoute("/equipamentos")({
  head: () => ({
    meta: [
      { title: "Controle de equipamentos — Oxigenoterapia Botucatu" },
      {
        name: "description",
        content:
          "Situação dos concentradores e cilindros de oxigênio: em uso, disponíveis, em manutenção ou retirados.",
      },
      { property: "og:title", content: "Controle de equipamentos" },
      {
        property: "og:description",
        content: "Rastreamento de concentradores e cilindros da rede municipal.",
      },
    ],
  }),
  component: Equipamentos,
});

const statusLabel: Record<string, string> = {
  disponivel: "Disponível",
  em_uso: "Em uso",
  em_manutencao: "Em manutenção",
  retirado: "Retirado",
  inativo: "Inativo",
};

const statusTone: Record<string, "success" | "scheduled" | "warning" | "closed" | "critical"> = {
  disponivel: "success",
  em_uso: "scheduled",
  em_manutencao: "warning",
  retirado: "closed",
  inativo: "critical",
};

function Equipamentos() {
  const [filtro, setFiltro] = useState("todos");

  const { data: equipamentos = [] } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase.from("equipment").select("*").order("numero");
      if (error) throw error;
      return data;
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["pacientes-basico"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, nome");
      if (error) throw error;
      return data;
    },
  });

  const nome = new Map(patients.map((p) => [p.id, p.nome]));
  const visiveis = equipamentos.filter((e) => filtro === "todos" || e.status === filtro);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Patrimônio"
        title="Equipamentos"
        description="Concentradores e cilindros distribuídos pela rede municipal."
        actions={
          <button
            type="button"
            onClick={() =>
              downloadCSV(
                "equipamentos.csv",
                visiveis.map((e) => ({
                  numero: e.numero,
                  tipo: e.tipo,
                  modelo: e.modelo ?? "",
                  status: statusLabel[e.status] ?? e.status,
                  paciente: e.paciente_id ? (nome.get(e.paciente_id) ?? "") : "",
                })),
              )
            }
            className="rounded-lg border bg-background/60 px-3 py-2 text-xs font-semibold"
          >
            Exportar CSV
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(["em_uso", "disponivel", "em_manutencao", "retirado"] as const).map((status) => (
          <StatCard
            key={status}
            label={statusLabel[status] ?? status}
            value={equipamentos.filter((e) => e.status === status).length}
            hint="equipamentos"
          />
        ))}
      </div>

      <div className="glass-panel my-4 flex flex-wrap gap-2 p-3">
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="rounded-lg border bg-background/70 px-3 py-2 text-sm"
        >
          <option value="todos">Todos os status</option>
          {Object.entries(statusLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3 font-semibold">Número</th>
              <th className="px-4 py-3 font-semibold">Tipo / modelo</th>
              <th className="px-4 py-3 font-semibold">Paciente</th>
              <th className="px-4 py-3 font-semibold">Entrega</th>
              <th className="px-4 py-3 font-semibold">Retirada</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{e.numero}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {e.tipo}
                  {e.modelo ? ` · ${e.modelo}` : ""}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {e.paciente_id ? (nome.get(e.paciente_id) ?? "—") : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(e.data_entrega)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(e.data_retirada)}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={statusTone[e.status] ?? "closed"} dot>
                    {statusLabel[e.status] ?? e.status}
                  </StatusBadge>
                </td>
              </tr>
            ))}
            {visiveis.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum equipamento encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
