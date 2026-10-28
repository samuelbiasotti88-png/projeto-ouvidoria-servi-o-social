import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  initials,
  patientStatusLabels,
  patientStatusTone,
  serviceStatusLabels,
  serviceStatusTone,
  todayISO,
  downloadCSV,
} from "@/lib/domain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pacientes/$id")({
  head: () => ({
    meta: [
      { title: "Ficha do paciente — Oxigenoterapia Botucatu" },
      {
        name: "description",
        content:
          "Ficha completa do paciente em oxigenoterapia domiciliar: dados, recargas, documentos e histórico.",
      },
      { property: "og:title", content: "Ficha do paciente" },
      {
        property: "og:description",
        content: "Resumo clínico-administrativo do atendimento de oxigenoterapia domiciliar.",
      },
    ],
  }),
  component: PacienteDetalhe,
});

const abas = [
  "Resumo",
  "Acompanhamento mensal",
  "Dados pessoais",
  "Oxigenoterapia",
  "Recargas",
  "Implantações",
  "Retiradas",
  "Documentos",
  "Ocorrências",
  "Histórico",
  "Auditoria",
] as const;

function PacienteDetalhe() {
  const { id } = Route.useParams();
  const [aba, setAba] = useState<(typeof abas)[number]>("Resumo");
  const { podeAuditar } = useAuth();
  const [mes, setMes] = useState(todayISO().slice(0, 7));

  const {
    data: paciente,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["paciente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const {
    data: recargas = [],
    isPending: recargasPending,
    isError: recargasError,
    refetch: recargasRefetch,
  } = useQuery({
    queryKey: ["paciente-recargas", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refills")
        .select("*")
        .eq("paciente_id", id)
        .order("data_prevista", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const {
    data: implantacoes = [],
    isPending: implantacoesPending,
    isError: implantacoesError,
    refetch: implantacoesRefetch,
  } = useQuery({
    queryKey: ["paciente-implantacoes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("installations")
        .select("*")
        .eq("paciente_id", id);
      if (error) throw error;
      return data;
    },
  });

  const {
    data: retiradas = [],
    isPending: retiradasPending,
    isError: retiradasError,
    refetch: retiradasRefetch,
  } = useQuery({
    queryKey: ["paciente-retiradas", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("removals").select("*").eq("paciente_id", id);
      if (error) throw error;
      return data;
    },
  });

  const {
    data: documentos = [],
    isPending: documentosPending,
    isError: documentosError,
    refetch: documentosRefetch,
  } = useQuery({
    queryKey: ["paciente-documentos", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").eq("paciente_id", id);
      if (error) throw error;
      return data;
    },
  });

  const { data: ocorrencias = [] } = useQuery({
    queryKey: ["paciente-ocorrencias", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("occurrences").select("*").eq("paciente_id", id);
      if (error) throw error;
      return data;
    },
  });

  const { data: historico = [] } = useQuery({
    queryKey: ["paciente-historico", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_history")
        .select("*")
        .eq("paciente_id", id)
        .order("ocorrido_em", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: auditoria = [] } = useQuery({
    queryKey: ["paciente-auditoria", id],
    enabled: podeAuditar,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("registro_id", id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  if (isPending || isError || !paciente) {
    return (
      <AppShell>
        {isPending ? (
          <p role="status">Carregando ficha do paciente…</p>
        ) : (
          <section className="glass-panel p-6" role={isError ? "alert" : undefined}>
            <h1 className="text-lg font-bold">
              {isError ? "Não foi possível carregar a ficha" : "Paciente não encontrado"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isError
                ? "Confira sua conexão e tente novamente."
                : "O registro pode ter sido removido ou seu perfil pode não ter acesso."}
            </p>
            {isError && (
              <button className="mt-4 rounded border px-4 py-2" onClick={() => void refetch()}>
                Tentar novamente
              </button>
            )}
            <Link to="/pacientes" className="ml-4 text-sm text-primary">
              Voltar aos pacientes
            </Link>
          </section>
        )}
      </AppShell>
    );
  }

  const mensalPendente =
    recargasPending || implantacoesPending || retiradasPending || documentosPending;
  const mensalErro = recargasError || implantacoesError || retiradasError || documentosError;
  const eventos = [
    ...recargas.map((r) => ({
      id: r.id,
      tipo: "Recarga",
      data: r.data_realizada ?? r.data_agendada ?? r.data_prevista ?? r.data_solicitacao,
      situacao: serviceStatusLabels[r.status],
      detalhe: r.numero_nota ? `Nota ${r.numero_nota}` : (r.observacoes ?? "—"),
    })),
    ...implantacoes.map((r) => ({
      id: r.id,
      tipo: "Implantação",
      data: r.data_realizada ?? r.data_agendada ?? r.data_prevista ?? r.data_solicitacao,
      situacao: serviceStatusLabels[r.status],
      detalhe: r.numero_equipamento ?? "—",
    })),
    ...retiradas.map((r) => ({
      id: r.id,
      tipo: "Retirada",
      data: r.data_realizada ?? r.data_agendada ?? r.data_prevista ?? r.data_solicitacao,
      situacao: serviceStatusLabels[r.status],
      detalhe: r.motivo ?? "—",
    })),
    ...documentos.map((d) => ({
      id: d.id,
      tipo: d.tipo === "nota_fiscal" ? "Nota fiscal" : "Documento",
      data: d.data,
      situacao: d.divergencia
        ? "Divergência"
        : d.conferido
          ? "Conferido"
          : "Aguardando conferência",
      detalhe: `${d.numero ?? "Sem número"} · ${formatCurrency(d.valor)}`,
    })),
  ]
    .filter((e) => e.data?.slice(0, 7) === mes)
    .sort((a, b) => (a.data ?? "").localeCompare(b.data ?? ""));
  const exportarMes = () =>
    downloadCSV(
      `acompanhamento-${mes}.csv`,
      eventos.map((e) => ({
        Data: formatDate(e.data),
        Paciente: paciente.nome,
        Tipo: e.tipo,
        Situação: e.situacao,
        Detalhes: e.detalhe,
      })),
    );

  return (
    <AppShell>
      <Link to="/pacientes" className="text-xs font-semibold text-primary hover:underline">
        ← Voltar para a lista
      </Link>

      <section className="glass-panel mt-3 p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/12 font-display text-base font-bold text-primary">
            {initials(paciente.nome)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold">{paciente.nome}</h1>
              <StatusBadge tone={patientStatusTone[paciente.status]} dot>
                {patientStatusLabels[paciente.status]}
              </StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {paciente.cpf ?? "sem CPF"} · SUS {paciente.cartao_sus ?? "—"} ·{" "}
              {paciente.telefone ?? "sem telefone"}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <Resumo titulo="Equipamento" valor={paciente.tipo_equipamento ?? "—"} />
          <Resumo titulo="Número" valor={paciente.numero_equipamento ?? "—"} />
          <Resumo titulo="Implantação" valor={formatDate(paciente.data_implantacao)} />
          <Resumo titulo="Última recarga" valor={formatDate(paciente.ultima_recarga)} />
          <Resumo titulo="Próxima recarga" valor={formatDate(paciente.proxima_recarga)} />
        </dl>

        <div className="mt-4 flex flex-wrap gap-1 border-t pt-3">
          {abas.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setAba(item)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                aba === item
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-background/60",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-panel mt-4 p-5">
        {aba === "Acompanhamento mensal" && (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-bold">Acompanhamento mensal</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Serviços pela data realizada; se pendentes, pela data agendada, prevista ou
                  solicitada. Documentos pela data de emissão.
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-sm">
                  Mês de referência
                  <input
                    aria-label="Mês de referência"
                    type="month"
                    value={mes}
                    onChange={(e) => {
                      if (/^\d{4}-\d{2}$/.test(e.target.value)) setMes(e.target.value);
                    }}
                    className="mt-1 block rounded border bg-background px-3 py-2"
                  />
                </label>
                <button
                  disabled={mensalPendente || mensalErro || !eventos.length}
                  onClick={exportarMes}
                  className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Exportar CSV
                </button>
              </div>
            </div>
            {mensalPendente ? (
              <p role="status" className="mt-6">
                Carregando registros do mês…
              </p>
            ) : mensalErro ? (
              <div role="alert" className="mt-6 rounded border border-red-200 bg-red-50 p-4">
                <p>
                  Não foi possível consultar todos os registros. O relatório está indisponível para
                  evitar informações incompletas.
                </p>
                <button
                  className="mt-3 underline"
                  onClick={() => {
                    void recargasRefetch();
                    void implantacoesRefetch();
                    void retiradasRefetch();
                    void documentosRefetch();
                  }}
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                <div className="my-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {["Recarga", "Implantação", "Retirada", "Nota fiscal"].map((tipo) => (
                    <div key={tipo} className="rounded border p-3">
                      <p className="text-xs text-muted-foreground">{tipo}</p>
                      <p className="mt-1 text-2xl font-bold">
                        {eventos.filter((e) => e.tipo === tipo).length}
                      </p>
                    </div>
                  ))}
                </div>
                {!eventos.length ? (
                  <p className="rounded border border-dashed p-6 text-sm text-muted-foreground">
                    Nenhum serviço ou documento com data neste mês.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <caption className="sr-only">Registros mensais de {paciente.nome}</caption>
                      <thead>
                        <tr className="border-b">
                          {["Data", "Tipo", "Situação", "Detalhes"].map((h) => (
                            <th scope="col" key={h} className="px-3 py-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {eventos.map((e) => (
                          <tr key={`${e.tipo}-${e.id}`} className="border-b">
                            <td className="whitespace-nowrap px-3 py-3">{formatDate(e.data)}</td>
                            <td className="px-3 py-3">{e.tipo}</td>
                            <td className="px-3 py-3">{e.situacao}</td>
                            <td className="min-w-40 break-words px-3 py-3">{e.detalhe}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {aba === "Resumo" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Bloco titulo="Situação atual">
              <Linha rotulo="Status" valor={patientStatusLabels[paciente.status]} />
              <Linha rotulo="Solicitação" valor={formatDate(paciente.data_solicitacao)} />
              <Linha rotulo="Autorização" valor={formatDate(paciente.data_autorizacao)} />
              <Linha rotulo="Implantação" valor={formatDate(paciente.data_implantacao)} />
              <Linha
                rotulo="Periodicidade"
                valor={`${paciente.periodicidade_recarga_dias ?? 30} dias`}
              />
            </Bloco>
            <Bloco titulo="Últimos eventos">
              {historico.slice(0, 6).map((h) => (
                <p key={h.id} className="text-sm">
                  <span className="text-muted-foreground">{formatDate(h.ocorrido_em)}</span> —{" "}
                  {h.evento}
                </p>
              ))}
              {historico.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem eventos registrados.</p>
              ) : null}
            </Bloco>
          </div>
        ) : null}

        {aba === "Dados pessoais" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Bloco titulo="Identificação">
              <Linha rotulo="Nome" valor={paciente.nome} />
              <Linha rotulo="CPF" valor={paciente.cpf ?? "—"} />
              <Linha rotulo="Cartão SUS" valor={paciente.cartao_sus ?? "—"} />
              <Linha rotulo="Nascimento" valor={formatDate(paciente.data_nascimento)} />
              <Linha rotulo="Telefone" valor={paciente.telefone ?? "—"} />
              <Linha rotulo="Telefone alternativo" valor={paciente.telefone_alt ?? "—"} />
              <Linha rotulo="Responsável" valor={paciente.responsavel ?? "—"} />
              <Linha rotulo="Parentesco" valor={paciente.parentesco ?? "—"} />
            </Bloco>
            <Bloco titulo="Endereço">
              <Linha rotulo="CEP" valor={paciente.cep ?? "—"} />
              <Linha
                rotulo="Logradouro"
                valor={`${paciente.logradouro ?? "—"}, ${paciente.numero ?? "s/n"}`}
              />
              <Linha rotulo="Complemento" valor={paciente.complemento ?? "—"} />
              <Linha rotulo="Bairro" valor={paciente.bairro ?? "—"} />
              <Linha
                rotulo="Cidade/UF"
                valor={`${paciente.cidade ?? "—"}/${paciente.estado ?? "—"}`}
              />
              <Linha rotulo="Referência" valor={paciente.referencia ?? "—"} />
            </Bloco>
          </div>
        ) : null}

        {aba === "Oxigenoterapia" ? (
          <Bloco titulo="Dados da oxigenoterapia">
            <Linha rotulo="Tipo de equipamento" valor={paciente.tipo_equipamento ?? "—"} />
            <Linha rotulo="Número do equipamento" valor={paciente.numero_equipamento ?? "—"} />
            <Linha rotulo="Tipo de oxigênio" valor={paciente.tipo_oxigenio ?? "—"} />
            <Linha
              rotulo="Prevista para implantação"
              valor={formatDate(paciente.data_prevista_implantacao)}
            />
            <Linha
              rotulo="Prevista para retirada"
              valor={formatDate(paciente.data_prevista_retirada)}
            />
            <Linha rotulo="Retirada efetiva" valor={formatDate(paciente.data_retirada)} />
            <Linha rotulo="Observações" valor={paciente.observacoes ?? "—"} />
          </Bloco>
        ) : null}

        {aba === "Recargas" ? (
          <TabelaServico
            linhas={recargas.map((r) => ({
              id: r.id,
              status: r.status,
              colunas: [
                formatDate(r.data_solicitacao),
                formatDate(r.data_agendada),
                formatDate(r.data_realizada),
                r.numero_nota ?? "—",
              ],
            }))}
            cabecalhos={["Solicitação", "Agendada", "Realizada", "Nota fiscal"]}
          />
        ) : null}

        {aba === "Implantações" ? (
          <TabelaServico
            linhas={implantacoes.map((r) => ({
              id: r.id,
              status: r.status,
              colunas: [
                formatDate(r.data_solicitacao),
                formatDate(r.data_agendada),
                formatDate(r.data_realizada),
                r.numero_equipamento ?? "—",
              ],
            }))}
            cabecalhos={["Solicitação", "Agendada", "Realizada", "Equipamento"]}
          />
        ) : null}

        {aba === "Retiradas" ? (
          <TabelaServico
            linhas={retiradas.map((r) => ({
              id: r.id,
              status: r.status,
              colunas: [
                formatDate(r.data_solicitacao),
                r.motivo ?? "—",
                formatDate(r.data_realizada),
                r.numero_equipamento ?? "—",
              ],
            }))}
            cabecalhos={["Solicitação", "Motivo", "Realizada", "Equipamento"]}
          />
        ) : null}

        {aba === "Documentos" ? (
          <div className="space-y-2">
            {documentos.map((d) => (
              <div
                key={d.id}
                className="glass-soft flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {d.tipo === "nota_fiscal" ? "Nota fiscal" : "Ordem de serviço"}{" "}
                    {d.numero ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(d.data)} · {formatCurrency(d.valor)} · {d.servico ?? "—"}
                  </p>
                </div>
                <StatusBadge
                  tone={d.divergencia ? "critical" : d.conferido ? "success" : "warning"}
                >
                  {d.divergencia
                    ? "Divergência"
                    : d.conferido
                      ? "Conferido"
                      : "Aguardando conferência"}
                </StatusBadge>
              </div>
            ))}
            {documentos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum documento vinculado.</p>
            ) : null}
          </div>
        ) : null}

        {aba === "Ocorrências" ? (
          <div className="space-y-2">
            {ocorrencias.map((o) => (
              <div key={o.id} className="glass-soft rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{o.titulo}</p>
                  <StatusBadge tone={o.situacao === "aberta" ? "critical" : "closed"}>
                    {o.situacao === "aberta" ? "Em aberto" : "Encerrada"}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">{o.descricao ?? "—"}</p>
              </div>
            ))}
            {ocorrencias.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada.</p>
            ) : null}
          </div>
        ) : null}

        {aba === "Histórico" ? (
          <ol className="relative space-y-4 border-l pl-5">
            {historico.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">{formatDateTime(h.ocorrido_em)}</p>
                <p className="text-sm font-semibold">{h.evento}</p>
                {h.detalhe ? <p className="text-xs text-muted-foreground">{h.detalhe}</p> : null}
              </li>
            ))}
            {historico.length === 0 ? (
              <li className="text-sm text-muted-foreground">Sem histórico.</li>
            ) : null}
          </ol>
        ) : null}

        {aba === "Auditoria" ? (
          podeAuditar ? (
            <div className="space-y-2">
              {auditoria.map((a) => (
                <div key={a.id} className="glass-soft rounded-xl px-4 py-3 text-sm">
                  <p className="text-xs text-muted-foreground">{formatDateTime(a.created_at)}</p>
                  <p className="font-semibold">
                    {a.acao} em {a.tabela} — {a.usuario_nome ?? "sistema"}
                  </p>
                </div>
              ))}
              {auditoria.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem registros de auditoria.</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Seu perfil não tem permissão para visualizar a auditoria.
            </p>
          )
        ) : null}
      </section>
    </AppShell>
  );
}

function Resumo({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">{titulo}</dt>
      <dd className="text-sm font-semibold">{valor}</dd>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="glass-soft rounded-xl p-4">
      <h2 className="font-display mb-3 text-sm font-bold">{titulo}</h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  );
}

function TabelaServico({
  cabecalhos,
  linhas,
}: {
  cabecalhos: string[];
  linhas: {
    id: string;
    status: keyof typeof serviceStatusLabels;
    colunas: string[];
  }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-[11px] tracking-wide text-muted-foreground uppercase">
            {cabecalhos.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
            <th className="px-3 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.id} className="border-b last:border-0">
              {linha.colunas.map((coluna, index) => (
                <td key={index} className="px-3 py-2 text-muted-foreground">
                  {coluna}
                </td>
              ))}
              <td className="px-3 py-2">
                <StatusBadge tone={serviceStatusTone[linha.status]}>
                  {serviceStatusLabels[linha.status]}
                </StatusBadge>
              </td>
            </tr>
          ))}
          {linhas.length === 0 ? (
            <tr>
              <td colSpan={cabecalhos.length + 1} className="px-3 py-4 text-muted-foreground">
                Nenhum registro.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
