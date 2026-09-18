import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, todayISO } from "@/lib/domain";

export const Route = createFileRoute("/pendencias")({
  head: () => ({
    meta: [
      { title: "Central de pendências — Oxigenoterapia Botucatu" },
      {
        name: "description",
        content:
          "Alertas automáticos de recargas atrasadas, serviços não realizados, documentos pendentes e cadastros incompletos.",
      },
      { property: "og:title", content: "Central de pendências" },
      {
        property: "og:description",
        content: "Todos os alertas do serviço de oxigenoterapia em uma única tela.",
      },
    ],
  }),
  component: Pendencias,
});

function Pendencias() {
  const hoje = todayISO();

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
    queryKey: ["occurrences-abertas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("occurrences")
        .select("*")
        .eq("situacao", "aberta");
      if (error) throw error;
      return data;
    },
  });

  const nome = new Map(patients.map((p) => [p.id, p.nome]));
  const atrasada = (status: string, prevista: string | null) =>
    status !== "realizada" && status !== "cancelada" && Boolean(prevista) && prevista! < hoje;

  const grupos = [
    {
      titulo: "Recargas atrasadas",
      tone: "critical" as const,
      itens: refills
        .filter((r) => atrasada(r.status, r.data_prevista))
        .map((r) => ({
          id: r.id,
          pacienteId: r.paciente_id,
          texto: `Prevista para ${formatDate(r.data_prevista)}`,
        })),
    },
    {
      titulo: "Implantações atrasadas",
      tone: "critical" as const,
      itens: installations
        .filter((i) => atrasada(i.status, i.data_prevista))
        .map((i) => ({
          id: i.id,
          pacienteId: i.paciente_id,
          texto: `Prevista para ${formatDate(i.data_prevista)}`,
        })),
    },
    {
      titulo: "Retiradas não realizadas",
      tone: "warning" as const,
      itens: removals
        .filter((r) => r.status === "nao_realizada" || atrasada(r.status, r.data_prevista))
        .map((r) => ({
          id: r.id,
          pacienteId: r.paciente_id,
          texto: r.motivo_nao_realizacao ?? `Prevista para ${formatDate(r.data_prevista)}`,
        })),
    },
    {
      titulo: "Documentos pendentes ou divergentes",
      tone: "warning" as const,
      itens: documents
        .filter((d) => !d.conferido || d.divergencia)
        .map((d) => ({
          id: d.id,
          pacienteId: d.paciente_id,
          texto: d.divergencia ?? `Documento ${d.numero ?? "sem número"} sem conferência`,
        })),
    },
    {
      titulo: "Cadastros incompletos",
      tone: "scheduled" as const,
      itens: patients
        .filter((p) => !p.cpf || !p.telefone || !p.bairro || !p.cartao_sus)
        .map((p) => ({
          id: p.id,
          pacienteId: p.id,
          texto: "Faltam dados obrigatórios (CPF, cartão SUS, telefone ou bairro)",
        })),
    },
    {
      titulo: "Ocorrências em aberto",
      tone: "critical" as const,
      itens: occurrences.map((o) => ({
        id: o.id,
        pacienteId: o.paciente_id,
        texto: o.titulo,
      })),
    },
  ];

  const total = grupos.reduce((soma, grupo) => soma + grupo.itens.length, 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Alertas automáticos"
        title="Central de pendências"
        description={`${total} alertas ativos gerados automaticamente a partir dos prazos e das conferências.`}
      />

      <div className="space-y-4">
        {grupos.map((grupo) => (
          <section key={grupo.titulo} className="glass-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-bold">{grupo.titulo}</h2>
              <StatusBadge tone={grupo.itens.length ? grupo.tone : "success"}>
                {grupo.itens.length}
              </StatusBadge>
            </div>
            <div className="mt-3 space-y-2">
              {grupo.itens.slice(0, 12).map((item) => (
                <div
                  key={item.id}
                  className="glass-soft flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-2.5"
                >
                  <span className="text-sm font-medium">
                    {item.pacienteId ? (nome.get(item.pacienteId) ?? "Sem paciente") : "Sem paciente"}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.texto}</span>
                  {item.pacienteId ? (
                    <Link
                      to="/pacientes/$id"
                      params={{ id: item.pacienteId }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Abrir ficha
                    </Link>
                  ) : null}
                </div>
              ))}
              {grupo.itens.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nada pendente aqui.</p>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
