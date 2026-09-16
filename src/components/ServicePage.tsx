import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  addDays,
  downloadCSV,
  formatDate,
  serviceStatusLabels,
  serviceStatusOptions,
  serviceStatusTone,
  todayISO,
  type ServiceStatus,
} from "@/lib/domain";

export type ServiceKind = "refills" | "installations" | "removals";

type Row = Record<string, unknown> & {
  id: string;
  paciente_id: string;
  status: ServiceStatus;
  data_solicitacao: string | null;
  data_prevista: string | null;
  data_agendada: string | null;
  data_realizada: string | null;
  empresa_id: string | null;
  observacoes: string | null;
};

type FieldType = "text" | "date" | "number" | "textarea";

type Field = { name: string; label: string; type: FieldType };

const commonFields: Field[] = [
  { name: "data_solicitacao", label: "Data da solicitação", type: "date" },
  { name: "data_prevista", label: "Data prevista", type: "date" },
  { name: "data_agendada", label: "Data agendada", type: "date" },
  { name: "data_realizada", label: "Data realizada", type: "date" },
];

const extraByKind: Record<ServiceKind, Field[]> = {
  refills: [
    { name: "tipo_oxigenio", label: "Tipo de oxigênio", type: "text" },
    { name: "quantidade", label: "Quantidade", type: "number" },
    { name: "numero_pedido", label: "Número do pedido", type: "text" },
    { name: "numero_os", label: "Ordem de serviço", type: "text" },
    { name: "numero_nota", label: "Nota fiscal", type: "text" },
  ],
  installations: [
    { name: "numero_equipamento", label: "Número do equipamento", type: "text" },
    { name: "responsavel", label: "Responsável pela execução", type: "text" },
  ],
  removals: [
    { name: "motivo", label: "Motivo da retirada", type: "text" },
    { name: "numero_equipamento", label: "Equipamento retirado", type: "text" },
    { name: "responsavel", label: "Responsável pela execução", type: "text" },
  ],
};

export function ServicePage({
  kind,
  eyebrow,
  title,
  description,
}: {
  kind: ServiceKind;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const { podeEditar } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"todos" | ServiceStatus>("todos");
  const [term, setTerm] = useState("");
  const [editing, setEditing] = useState<Partial<Row> | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: [kind],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(kind)
        .select("*")
        .order("data_prevista", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["pacientes-basico"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, nome, periodicidade_recarga_dias")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["empresas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, nome").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const patientName = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((p) => map.set(p.id, p.nome));
    return map;
  }, [patients]);

  const companyName = useMemo(() => {
    const map = new Map<string, string>();
    companies.forEach((c) => map.set(c.id, c.nome));
    return map;
  }, [companies]);

  const visible = rows.filter((row) => {
    if (statusFilter !== "todos" && row.status !== statusFilter) return false;
    if (term.trim()) {
      const haystack = `${patientName.get(row.paciente_id) ?? ""} ${JSON.stringify(row)}`.toLowerCase();
      if (!haystack.includes(term.trim().toLowerCase())) return false;
    }
    return true;
  });

  const save = useMutation({
    mutationFn: async (form: Partial<Row>) => {
      const payload: Record<string, unknown> = { ...form };
      delete payload["id"];
      delete payload["created_at"];
      delete payload["updated_at"];

      let savedId = form.id;
      if (form.id) {
        const { error } = await supabase.from(kind).update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from(kind).insert(payload as never).select("id").single();
        if (error) throw error;
        savedId = data.id;
      }

      // Efeitos automáticos quando o serviço é concluído
      const pacienteId = String(form.paciente_id);
      const realizada = form.status === "realizada" && form.data_realizada;
      if (realizada) {
        if (kind === "refills") {
          const paciente = patients.find((p) => p.id === pacienteId);
          const periodicidade = paciente?.periodicidade_recarga_dias ?? 30;
          await supabase
            .from("patients")
            .update({
              ultima_recarga: form.data_realizada as string,
              proxima_recarga: addDays(form.data_realizada as string, periodicidade),
              status: "oxigenio_ativo",
            })
            .eq("id", pacienteId);
          await supabase.from("patient_history").insert({
            paciente_id: pacienteId,
            evento: "Recarga realizada",
            detalhe: `Nota ${(form["numero_nota"] as string) ?? "—"}`,
            categoria: "recarga",
            ocorrido_em: new Date(`${form.data_realizada as string}T12:00:00`).toISOString(),
          });
        }
        if (kind === "installations") {
          await supabase
            .from("patients")
            .update({
              data_implantacao: form.data_realizada as string,
              status: "oxigenio_ativo",
              numero_equipamento: (form["numero_equipamento"] as string) ?? null,
            })
            .eq("id", pacienteId);
          await supabase.from("patient_history").insert({
            paciente_id: pacienteId,
            evento: "Implantação realizada",
            detalhe: `Equipamento ${(form["numero_equipamento"] as string) ?? "—"}`,
            categoria: "implantacao",
            ocorrido_em: new Date(`${form.data_realizada as string}T12:00:00`).toISOString(),
          });
        }
        if (kind === "removals") {
          await supabase
            .from("patients")
            .update({
              data_retirada: form.data_realizada as string,
              status: "retirada_realizada",
            })
            .eq("id", pacienteId);
          const numero = form["numero_equipamento"] as string | undefined;
          if (numero) {
            await supabase
              .from("equipment")
              .update({
                status: "disponivel",
                paciente_id: null,
                data_retirada: form.data_realizada as string,
              })
              .eq("numero", numero);
          }
          await supabase.from("patient_history").insert({
            paciente_id: pacienteId,
            evento: "Retirada realizada",
            detalhe: `Equipamento ${numero ?? "—"} recolhido`,
            categoria: "retirada",
            ocorrido_em: new Date(`${form.data_realizada as string}T12:00:00`).toISOString(),
          });
        }
      }
      return savedId;
    },
    onSuccess: () => {
      toast.success("Registro salvo.");
      setEditing(null);
      void queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const fields = [...commonFields, ...extraByKind[kind]];

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <>
            <button
              type="button"
              onClick={() =>
                downloadCSV(
                  `${kind}.csv`,
                  visible.map((row) => ({
                    paciente: patientName.get(row.paciente_id) ?? "",
                    status: serviceStatusLabels[row.status],
                    prevista: row.data_prevista ?? "",
                    agendada: row.data_agendada ?? "",
                    realizada: row.data_realizada ?? "",
                    empresa: row.empresa_id ? (companyName.get(row.empresa_id) ?? "") : "",
                  })),
                )
              }
              className="rounded-lg border bg-background/60 px-3 py-2 text-xs font-semibold"
            >
              Exportar CSV
            </button>
            {podeEditar ? (
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    status: "solicitada",
                    data_solicitacao: todayISO(),
                  } as Partial<Row>)
                }
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-brand)]"
              >
                Novo registro
              </button>
            ) : null}
          </>
        }
      />

      <div className="glass-panel mb-4 flex flex-wrap items-center gap-2 p-3">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por paciente, nota, pedido…"
          className="min-w-56 flex-1 rounded-lg border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border bg-background/70 px-3 py-2 text-sm"
        >
          <option value="todos">Todos os status</option>
          {serviceStatusOptions.map((status) => (
            <option key={status} value={status}>
              {serviceStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-3 font-semibold">Paciente</th>
                <th className="px-4 py-3 font-semibold">Solicitação</th>
                <th className="px-4 py-3 font-semibold">Prevista</th>
                <th className="px-4 py-3 font-semibold">Agendada</th>
                <th className="px-4 py-3 font-semibold">Realizada</th>
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                    Carregando…
                  </td>
                </tr>
              ) : null}
              {!isLoading && visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : null}
              {visible.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-background/40">
                  <td className="px-4 py-3">
                    <Link
                      to="/pacientes/$id"
                      params={{ id: row.paciente_id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {patientName.get(row.paciente_id) ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(row.data_solicitacao)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(row.data_prevista)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(row.data_agendada)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(row.data_realizada)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.empresa_id ? (companyName.get(row.empresa_id) ?? "—") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={serviceStatusTone[row.status]} dot>
                      {serviceStatusLabels[row.status]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {podeEditar ? "Editar" : "Ver"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!podeEditar) {
                toast.error("Seu perfil permite apenas consulta.");
                return;
              }
              if (
                editing.status === "nao_realizada" &&
                kind !== "refills" &&
                !editing["motivo_nao_realizacao"]
              ) {
                toast.error("Informe o motivo da não realização.");
                return;
              }
              if (!editing.paciente_id) {
                toast.error("Selecione o paciente.");
                return;
              }
              save.mutate(editing);
            }}
            className="glass-panel my-8 w-full max-w-2xl p-6"
          >
            <h2 className="font-display text-lg font-bold">
              {editing.id ? "Editar registro" : "Novo registro"}
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Paciente
                <select
                  value={(editing.paciente_id as string) ?? ""}
                  onChange={(e) => setEditing({ ...editing, paciente_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                  required
                >
                  <option value="">Selecione…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-muted-foreground">
                Empresa responsável
                <select
                  value={(editing.empresa_id as string) ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, empresa_id: e.target.value || null })
                  }
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                >
                  <option value="">Não informada</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>

              {fields.map((field) => (
                <label key={field.name} className="text-xs font-semibold text-muted-foreground">
                  {field.label}
                  <input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    value={(editing[field.name] as string | number | null) ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        [field.name]:
                          e.target.value === ""
                            ? null
                            : field.type === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                  />
                </label>
              ))}

              <label className="text-xs font-semibold text-muted-foreground">
                Status
                <select
                  value={editing.status ?? "solicitada"}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as ServiceStatus })
                  }
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                >
                  {serviceStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {serviceStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>

              {kind !== "refills" ? (
                <label className="text-xs font-semibold text-muted-foreground sm:col-span-2">
                  Motivo da não realização
                  <input
                    value={(editing["motivo_nao_realizacao"] as string) ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, motivo_nao_realizacao: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                  />
                </label>
              ) : null}

              <label className="text-xs font-semibold text-muted-foreground sm:col-span-2">
                Observações
                <textarea
                  rows={3}
                  value={(editing.observacoes as string) ?? ""}
                  onChange={(e) => setEditing({ ...editing, observacoes: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={save.isPending || !podeEditar}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] disabled:opacity-60"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
