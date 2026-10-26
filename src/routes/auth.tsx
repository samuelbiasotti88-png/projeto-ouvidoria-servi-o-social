import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso restrito — Oxigenoterapia Domiciliar Botucatu" },
      {
        name: "description",
        content: "Área de acesso para servidores da Secretaria Municipal de Saúde de Botucatu-SP.",
      },
      { property: "og:title", content: "Acesso restrito — Oxigenoterapia Domiciliar" },
      {
        property: "og:description",
        content: "Sistema interno de gestão de oxigenoterapia domiciliar.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) void navigate({ to: "/" });
  }, [session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        toast.success("Acesso liberado.");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: { nome },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Cadastro enviado. Confirme o e-mail para acessar.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh items-center bg-[#f4f6f9] px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:px-[8vw]">
      <section className="mb-8 hidden max-w-xl lg:block">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Secretaria Municipal de Saúde · Botucatu
        </p>
        <h1 className="mt-5 text-5xl font-semibold leading-tight text-[#123355]">
          Cuidado contínuo.
          <br />
          Gestão organizada.
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
          Pacientes, equipamentos e serviços de oxigenoterapia domiciliar em um ambiente de trabalho
          centralizado.
        </p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm">
          <span className="size-2 rounded-full bg-emerald-600" />
          Acesso restrito à equipe autorizada
        </div>
      </section>
      <div className="glass-panel mx-auto w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-[#123355] text-primary-foreground">
            <span className="font-display text-lg font-bold">O₂</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold">Vital Air</h1>
            <p className="text-xs text-muted-foreground">Gestão de oxigenoterapia domiciliar</p>
          </div>
        </div>

        <h2 className="mb-1 text-xl font-semibold">
          {mode === "entrar" ? "Acesse sua conta" : "Primeiro acesso"}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {mode === "entrar"
            ? "Informe seus dados para abrir o painel."
            : "Cadastro disponível somente para e-mails autorizados."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "criar" ? (
            <div>
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="nome">
                Nome do servidor
              </label>
              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          ) : null}
          <div>
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
              E-mail institucional
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete={mode === "entrar" ? "current-password" : "new-password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground  transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Aguarde…" : mode === "entrar" ? "Entrar no sistema" : "Criar acesso"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
          className="mt-4 w-full text-center text-xs font-semibold text-primary"
        >
          {mode === "entrar" ? "Primeiro acesso? Criar cadastro" : "Já tenho acesso — entrar"}
        </button>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Ambiente de homologação · Uso exclusivo da equipe autorizada.
        </p>
      </div>
    </main>
  );
}
