import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-md p-8 text-center">
        <h1 className="font-display text-6xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Ir para o painel
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou volte ao painel.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Ir para o painel
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Gestão de Oxigenoterapia Domiciliar — Botucatu-SP" },
      {
        name: "description",
        content:
          "Sistema interno da Secretaria Municipal de Saúde de Botucatu-SP para gestão de oxigenoterapia domiciliar.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <AuthGate>
          <Outlet />
        </AuthGate>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading, accessError, signOut } = useAuth();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  useEffect(() => {
    if (path !== "/auth" && !loading && !session) void navigate({ to: "/auth" });
  }, [path, loading, session, navigate]);
  if (path === "/auth") return children;
  if (loading)
    return (
      <div
        role="status"
        className="grid min-h-dvh place-items-center text-sm text-muted-foreground"
      >
        Carregando seu perfil de acesso…
      </div>
    );
  if (!session) return null;
  if (accessError)
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <section role="alert" className="glass-panel max-w-md p-6">
          <h1 className="text-lg font-semibold">Acesso não carregado</h1>
          <p className="mt-3 text-sm text-muted-foreground">{accessError}</p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm text-white"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm"
              onClick={() => void signOut()}
            >
              Sair
            </button>
          </div>
        </section>
      </main>
    );
  return children;
}
