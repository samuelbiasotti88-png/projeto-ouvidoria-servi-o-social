import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/domain";

type AuthState = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  nome: string;
  loading: boolean;
  accessError: string | null;
  podeEditar: boolean;
  isAdmin: boolean;
  podeAuditar: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileLoadedFor, setProfileLoadedFor] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        queryClient.clear();
        setProfileLoadedFor(null);
        setAccessError(null);
        setRoles([]);
        setNome("");
      }
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });

    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    let active = true;

    void (async () => {
      const [{ data: roleRows, error: roleError }, { data: profile, error: profileError }] =
        await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", userId),
          supabase.from("profiles").select("nome").eq("id", userId).maybeSingle(),
        ]);
      if (!active) return;
      setAccessError(
        roleError || profileError
          ? "Não foi possível carregar seu perfil de acesso. Tente novamente."
          : !roleRows?.length
            ? "Seu usuário ainda não possui um perfil autorizado. Entre em contato com o administrador."
            : null,
      );
      setProfileLoadedFor(userId);
      setRoles((roleRows ?? []).map((r) => r.role as AppRole));
      setNome(profile?.nome ?? session?.user?.email?.split("@")[0] ?? "");
    })();

    return () => {
      active = false;
    };
  }, [session?.user?.id, session?.user?.email]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      roles,
      nome,
      loading: loading || (!!session && profileLoadedFor !== session.user.id),
      accessError,
      podeEditar: roles.includes("admin") || roles.includes("operador"),
      isAdmin: roles.includes("admin"),
      podeAuditar: roles.includes("admin") || roles.includes("auditor") || roles.includes("gestor"),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, roles, nome, loading, profileLoadedFor, accessError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
