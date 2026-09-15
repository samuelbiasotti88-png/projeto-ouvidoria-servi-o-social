import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso restrito — Oxigenoterapia Domiciliar Botucatu" },
      {
        name: "description",
        content:
          "Área de acesso para servidores da Secretaria Municipal de Saúde de Botucatu-SP.",
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

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-brand)]">
            <span className="font-display text-lg font-bold">O₂</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold">Gestão de Oxigenoterapia Domiciliar</h1>
            <p className="text-xs text-muted-foreground">
              Secretaria Municipal de Saúde — Botucatu-SP
            </p>
          </div>
        </div>

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
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {mode === "entrar" ? "Entrar" : "Criar acesso"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void handleGoogle()}
          className="mt-3 w-full rounded-xl border bg-background/60 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
        >
          Continuar com o Google
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
          className="mt-4 w-full text-center text-xs font-semibold text-primary"
        >
          {mode === "entrar" ? "Primeiro acesso? Criar cadastro" : "Já tenho acesso — entrar"}
        </button>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Uso exclusivo de servidores autorizados. Todos os acessos e alterações são registrados
          para auditoria (LGPD).
        </p>
      </div>
    </main>
  );
}
