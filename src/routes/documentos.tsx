import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, formatCurrency, formatDate, todayISO } from "@/lib/domain";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos e notas fiscais — Oxigenoterapia Botucatu" },
      {
        name: "description",
        content:
          "Conferência de notas fiscais e documentos das empresas fornecedoras de oxigênio domiciliar.",
      },
      { property: "og:title", content: "Documentos e notas fiscais" },
      {
        property: "og:description",
        content: "Conferência documental e tratamento de divergências.",
      },
    ],
  }),
  component: Documentos,
});

type Doc = {
  id: string;
  paciente_id: string | null;
  tipo: string;
  numero: string | null;
  data: string | null;
  empresa_id: string | null;
  valor: number | null;
  servico: string | null;
  conferido: boolean;
  divergencia: string | null;
  divergencia_situacao: string | null;
  observacoes: string | null;
};

function Documentos() {
  const { podeEditar } = useAuth();
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<"todos" | "pendentes" | "divergentes" | "conferidos">("todos");
  const [form, setForm] = useState<Partial<Doc> | null>(null);

  const { data: documentos = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("data", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as unknown as Doc[];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["pacientes-basico"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, nome").order("nome");
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

  const nome = new Map(patients.map((p) => [p.id, p.nome]));
  const empresa = new Map(companies.map((c) => [c.id, c.nome]));

  const visiveis = documentos.filter((d) => {
    if (filtro === "pendentes") return !d.conferido;
    if (filtro === "divergentes") return Boolean(d.divergencia);
    if (filtro === "conferidos") return d.conferido;
    return true;
  });

  const salvar = useMutation({
    mutationFn: async (doc: Partial<Doc>) => {
      const payload = { ...doc } as Record<string, unknown>;
      delete payload["id"];
      if (doc.id) {
        const { error } = await supabase
          .from("documents")
          .update(payload as never)
          .eq("id", doc.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("documents").insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Documento atualizado.");
      setForm(null);
      void queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Conferência"
        title="Documentos e notas fiscais"
        description="Cada documento é confrontado com a solicitação, a recarga e o serviço executado. Nenhuma conferência é concluída sem validação humana."
        actions={
          <>
            <button
              type="button"
              onClick={() =>
                downloadCSV(
                  "documentos.csv",
                  visiveis.map((d) => ({
                    numero: d.numero ?? "",
                    tipo: d.tipo,
                    data: d.data ?? "",
                    paciente: d.paciente_id ? (nome.get(d.paciente_id) ?? "") : "",
                    empresa: d.empresa_id ? (empresa.get(d.empresa_id) ?? "") : "",
                    valor: d.valor ?? "",
                    conferido: d.conferido ? "sim" : "não",
                    divergencia: d.divergencia ?? "",
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
                  setForm({ tipo: "nota_fiscal", data: todayISO(), conferido: false })
                }
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-brand)]"
              >
                Lançar documento
              </button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Aguardando conferência" value={documentos.filter((d) => !d.conferido).length} tone="warning" />
        <StatCard
          label="Com divergência"
          value={documentos.filter((d) => d.divergencia).length}
          tone="critical"
          hint="Exigem justificativa ou correção"
        />
        <StatCard label="Conferidos" value={documentos.filter((d) => d.conferido).length} tone="success" />
      </div>

      <div className="glass-panel my-4 flex flex-wrap gap-2 p-3">
        {(["todos", "pendentes", "divergentes", "conferidos"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFiltro(item)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              filtro === item ? "bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visiveis.map((d) => (
          <article key={d.id} className="glass-panel flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-56 flex-1">
              <p className="text-sm font-semibold">
                {d.tipo === "nota_fiscal" ? "Nota fiscal" : "Documento"} {d.numero ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(d.data)} ·{" "}
                {d.paciente_id ? (nome.get(d.paciente_id) ?? "—") : "sem paciente"} ·{" "}
                {d.empresa_id ? (empresa.get(d.empresa_id) ?? "—") : "sem empresa"}
              </p>
              {d.divergencia ? (
                <p className="mt-1 text-xs text-critical">Divergência: {d.divergencia}</p>
              ) : null}
            </div>
            <span className="text-sm font-semibold">{formatCurrency(d.valor)}</span>
            <StatusBadge tone={d.divergencia ? "critical" : d.conferido ? "success" : "warning"} dot>
              {d.divergencia
                ? (d.divergencia_situacao ?? "Divergência aberta")
                : d.conferido
                  ? "Conferido"
                  : "Aguardando conferência"}
            </StatusBadge>
            <button
              type="button"
              onClick={() => setForm(d)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {podeEditar ? "Conferir" : "Ver"}
            </button>
          </article>
        ))}
        {visiveis.length === 0 ? (
          <p className="glass-panel p-6 text-center text-sm text-muted-foreground">
            Nenhum documento neste filtro.
          </p>
        ) : null}
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!podeEditar) {
                toast.error("Seu perfil permite apenas consulta.");
                return;
              }
              salvar.mutate(form);
            }}
            className="glass-panel my-8 w-full max-w-2xl p-6"
          >
            <h2 className="font-display text-lg font-bold">Conferência do documento</h2>
            <p className="text-xs text-muted-foreground">
              A leitura automática pode sugerir dados, mas a confirmação é sempre humana.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Paciente
                <select
                  value={form.paciente_id ?? ""}
                  onChange={(e) => setForm({ ...form, paciente_id: e.target.value || null })}
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                >
                  <option value="">Não vinculado</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Empresa
                <select
                  value={form.empresa_id ?? ""}
                  onChange={(e) => setForm({ ...form, empresa_id: e.target.value || null })}
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
              <label className="text-xs font-semibold text-muted-foreground">
                Número
                <input
                  value={form.numero ?? ""}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Data
                <input
                  type="date"
                  value={form.data ?? ""}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Valor (R$)
                <input
                  type="number"
                  step="0.01"
                  value={form.valor ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, valor: e.target.value === "" ? null : Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Serviço
                <input
                  value={form.servico ?? ""}
                  onChange={(e) => setForm({ ...form, servico: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground sm:col-span-2">
                Divergência encontrada
                <input
                  value={form.divergencia ?? ""}
                  onChange={(e) => setForm({ ...form, divergencia: e.target.value || null })}
                  placeholder="Ex.: quantidade da nota diferente da recarga registrada"
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Situação da divergência
                <select
                  value={form.divergencia_situacao ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, divergencia_situacao: e.target.value || null })
                  }
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                >
                  <option value="">Em aberto</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Corrigida">Corrigida</option>
                  <option value="Justificada">Justificada</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(form.conferido)}
                  onChange={(e) => setForm({ ...form, conferido: e.target.checked })}
                  className="size-4"
                />
                Confirmo a conferência deste documento
              </label>
              <label className="text-xs font-semibold text-muted-foreground sm:col-span-2">
                Observações
                <textarea
                  rows={3}
                  value={form.observacoes ?? ""}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvar.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] disabled:opacity-60"
              >
                Salvar conferência
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
