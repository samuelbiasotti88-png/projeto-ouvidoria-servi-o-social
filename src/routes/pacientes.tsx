import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  downloadCSV,
  formatDate,
  initials,
  maskCEP,
  maskCPF,
  maskPhone,
  patientStatusLabels,
  patientStatusOptions,
  patientStatusTone,
  todayISO,
  type PatientStatus,
} from "@/lib/domain";

export const Route = createFileRoute("/pacientes")({
  head: () => ({
    meta: [
      { title: "Pacientes em oxigenoterapia — Botucatu-SP" },
      {
        name: "description",
        content:
          "Cadastro e acompanhamento dos pacientes em oxigenoterapia domiciliar do município de Botucatu.",
      },
      { property: "og:title", content: "Pacientes em oxigenoterapia" },
      {
        property: "og:description",
        content: "Cadastro completo, status e histórico dos pacientes atendidos.",
      },
    ],
  }),
  component: PacientesPage,
});

type NovoPaciente = {
  nome: string;
  cpf: string;
  cartao_sus: string;
  data_nascimento: string;
  telefone: string;
  responsavel: string;
  parentesco: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  tipo_equipamento: string;
  tipo_oxigenio: string;
  periodicidade_recarga_dias: number;
  data_solicitacao: string;
  observacoes: string;
};

const vazio: NovoPaciente = {
  nome: "",
  cpf: "",
  cartao_sus: "",
  data_nascimento: "",
  telefone: "",
  responsavel: "",
  parentesco: "",
  cep: "",
  logradouro: "",
  numero: "",
  bairro: "",
  tipo_equipamento: "Concentrador",
  tipo_oxigenio: "Concentrador",
  periodicidade_recarga_dias: 30,
  data_solicitacao: todayISO(),
  observacoes: "",
};

function PacientesPage() {
  const { podeEditar } = useAuth();
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | PatientStatus>("todos");
  const [bairroFilter, setBairroFilter] = useState("todos");
  const [form, setForm] = useState<NovoPaciente | null>(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const bairros = useMemo(
    () => Array.from(new Set(patients.map((p) => p.bairro).filter(Boolean))).sort() as string[],
    [patients],
  );

  const duplicidade = useMemo(() => {
    if (!form) return null;
    const cpf = form.cpf.replace(/\D/g, "");
    const match = patients.find((p) => {
      if (cpf && p.cpf && p.cpf.replace(/\D/g, "") === cpf) return true;
      if (form.cartao_sus && p.cartao_sus === form.cartao_sus) return true;
      if (
        form.nome &&
        p.nome.toLowerCase() === form.nome.toLowerCase() &&
        (p.data_nascimento === form.data_nascimento || p.telefone === form.telefone)
      )
        return true;
      return false;
    });
    return match ?? null;
  }, [form, patients]);

  const visible = patients.filter((p) => {
    if (statusFilter !== "todos" && p.status !== statusFilter) return false;
    if (bairroFilter !== "todos" && p.bairro !== bairroFilter) return false;
    if (term.trim()) {
      const t = term.trim().toLowerCase();
      const hay = `${p.nome} ${p.cpf ?? ""} ${p.cartao_sus ?? ""} ${p.telefone ?? ""} ${p.numero_equipamento ?? ""} ${p.bairro ?? ""} ${p.logradouro ?? ""}`.toLowerCase();
      if (!hay.includes(t)) return false;
    }
    return true;
  });

  const criar = useMutation({
    mutationFn: async (novo: NovoPaciente) => {
      const { data, error } = await supabase
        .from("patients")
        .insert({ ...novo, status: "solicitacao_recebida" })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("patient_history").insert({
        paciente_id: data.id,
        evento: "Solicitação cadastrada",
        detalhe: "Paciente incluído no sistema",
        categoria: "solicitacao",
      });
      return data.id;
    },
    onSuccess: () => {
      toast.success("Paciente cadastrado.");
      setForm(null);
      void queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Cadastro"
        title="Pacientes"
        description={`${patients.length} pacientes cadastrados · ${patients.filter((p) => p.status === "oxigenio_ativo").length} com oxigênio ativo`}
        actions={
          <>
            <button
              type="button"
              onClick={() =>
                downloadCSV(
                  "pacientes.csv",
                  visible.map((p) => ({
                    nome: p.nome,
                    cpf: p.cpf ?? "",
                    cartao_sus: p.cartao_sus ?? "",
                    telefone: p.telefone ?? "",
                    bairro: p.bairro ?? "",
                    status: patientStatusLabels[p.status],
                    equipamento: p.numero_equipamento ?? "",
                    proxima_recarga: p.proxima_recarga ?? "",
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
                onClick={() => setForm(vazio)}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-brand)]"
              >
                Novo paciente
              </button>
            ) : null}
          </>
        }
      />

      <div className="glass-panel mb-4 flex flex-wrap items-center gap-2 p-3">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Nome, CPF, cartão SUS, telefone, endereço ou equipamento"
          className="min-w-64 flex-1 rounded-lg border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border bg-background/70 px-3 py-2 text-sm"
        >
          <option value="todos">Todos os status</option>
          {patientStatusOptions.map((s) => (
            <option key={s} value={s}>
              {patientStatusLabels[s]}
            </option>
          ))}
        </select>
        <select
          value={bairroFilter}
          onChange={(e) => setBairroFilter(e.target.value)}
          className="rounded-lg border bg-background/70 px-3 py-2 text-sm"
        >
          <option value="todos">Todos os bairros</option>
          {bairros.map((b) => (
            <option key={b} value={b}>
              {b}
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
                <th className="px-4 py-3 font-semibold">Equipamento</th>
                <th className="px-4 py-3 font-semibold">Bairro</th>
                <th className="px-4 py-3 font-semibold">Última recarga</th>
                <th className="px-4 py-3 font-semibold">Próxima recarga</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    Carregando…
                  </td>
                </tr>
              ) : null}
              {visible.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-background/40">
                  <td className="px-4 py-3">
                    <Link
                      to="/pacientes/$id"
                      params={{ id: p.id }}
                      className="flex items-center gap-3"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                        {initials(p.nome)}
                      </span>
                      <span>
                        <span className="block font-medium text-foreground hover:underline">
                          {p.nome}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {p.cpf ?? "sem CPF"} · {p.telefone ?? "sem telefone"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.tipo_equipamento ?? "—"}
                    {p.numero_equipamento ? ` · ${p.numero_equipamento}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.bairro ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.ultima_recarga)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(p.proxima_recarga)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={patientStatusTone[p.status]} dot>
                      {patientStatusLabels[p.status]}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
              {!isLoading && visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhum paciente encontrado com esses filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (duplicidade) {
                toast.error(`Possível cadastro duplicado: ${duplicidade.nome}.`);
                return;
              }
              criar.mutate(form);
            }}
            className="glass-panel my-8 w-full max-w-3xl p-6"
          >
            <h2 className="font-display text-lg font-bold">Novo paciente</h2>
            <p className="text-xs text-muted-foreground">
              O sistema verifica automaticamente duplicidade por CPF, cartão SUS, nome com data de
              nascimento e nome com telefone.
            </p>

            {duplicidade ? (
              <div className="mt-3 rounded-xl bg-warning-surface px-4 py-3 text-sm text-warning-foreground">
                ⚠️ Possível cadastro duplicado: <strong>{duplicidade.nome}</strong>. Verifique antes
                de salvar.
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Campo
                label="Nome completo"
                value={form.nome}
                onChange={(v) => setForm({ ...form, nome: v })}
                required
                className="sm:col-span-2"
              />
              <Campo label="CPF" value={form.cpf} onChange={(v) => setForm({ ...form, cpf: maskCPF(v) })} />
              <Campo
                label="Cartão SUS"
                value={form.cartao_sus}
                onChange={(v) => setForm({ ...form, cartao_sus: v.replace(/\D/g, "").slice(0, 15) })}
              />
              <Campo
                label="Data de nascimento"
                type="date"
                value={form.data_nascimento}
                onChange={(v) => setForm({ ...form, data_nascimento: v })}
              />
              <Campo
                label="Telefone"
                value={form.telefone}
                onChange={(v) => setForm({ ...form, telefone: maskPhone(v) })}
              />
              <Campo
                label="Responsável/familiar"
                value={form.responsavel}
                onChange={(v) => setForm({ ...form, responsavel: v })}
              />
              <Campo
                label="Grau de parentesco"
                value={form.parentesco}
                onChange={(v) => setForm({ ...form, parentesco: v })}
              />
              <Campo label="CEP" value={form.cep} onChange={(v) => setForm({ ...form, cep: maskCEP(v) })} />
              <Campo
                label="Logradouro"
                value={form.logradouro}
                onChange={(v) => setForm({ ...form, logradouro: v })}
              />
              <Campo label="Número" value={form.numero} onChange={(v) => setForm({ ...form, numero: v })} />
              <Campo label="Bairro" value={form.bairro} onChange={(v) => setForm({ ...form, bairro: v })} />
              <Campo
                label="Tipo de equipamento"
                value={form.tipo_equipamento}
                onChange={(v) => setForm({ ...form, tipo_equipamento: v })}
              />
              <Campo
                label="Tipo de oxigênio"
                value={form.tipo_oxigenio}
                onChange={(v) => setForm({ ...form, tipo_oxigenio: v })}
              />
              <Campo
                label="Periodicidade de recarga (dias)"
                type="number"
                value={String(form.periodicidade_recarga_dias)}
                onChange={(v) => setForm({ ...form, periodicidade_recarga_dias: Number(v) || 30 })}
              />
              <Campo
                label="Data da solicitação"
                type="date"
                value={form.data_solicitacao}
                onChange={(v) => setForm({ ...form, data_solicitacao: v })}
              />
              <label className="text-xs font-semibold text-muted-foreground sm:col-span-2">
                Observações
                <textarea
                  rows={3}
                  value={form.observacoes}
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
                disabled={criar.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] disabled:opacity-60"
              >
                Cadastrar paciente
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`text-xs font-semibold text-muted-foreground ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-primary"
      />
    </label>
  );
}
