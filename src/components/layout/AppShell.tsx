import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  Search,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { initials, roleLabels } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const navGroups = [
  {
    label: "Atendimento",
    items: [
      { to: "/", label: "Visão geral", icon: Home },
      { to: "/pacientes", label: "Pacientes", icon: Users },
      { to: "/agenda", label: "Agenda de serviços", icon: CalendarDays },
    ],
  },
  {
    label: "Operação",
    items: [
      { to: "/implantacoes", label: "Implantações", icon: HeartPulse },
      { to: "/recargas", label: "Recargas", icon: Activity },
      { to: "/retiradas", label: "Retiradas", icon: Truck },
      { to: "/equipamentos", label: "Equipamentos", icon: Wrench },
    ],
  },
  {
    label: "Controle",
    items: [
      { to: "/documentos", label: "Notas e documentos", icon: FileText },
      { to: "/pendencias", label: "Pendências", icon: ClipboardList },
      { to: "/indicadores", label: "Indicadores", icon: BarChart3 },
    ],
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading, nome, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth" });
  }, [loading, session, navigate]);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  if (loading || !session)
    return (
      <div
        role="status"
        className="grid min-h-dvh place-items-center text-sm text-muted-foreground"
      >
        Carregando seu ambiente de trabalho…
      </div>
    );

  const navigation = (
    <>
      <div className="border-b border-white/15 px-6 py-6">
        <Link to="/" className="block text-white">
          <span className="text-[11px] font-semibold tracking-[0.22em] text-blue-200 uppercase">
            Gestão domiciliar
          </span>
          <div className="mt-1 text-2xl font-bold tracking-tight">
            Vital Air<span className="text-emerald-300">.</span>
          </div>
        </Link>
        <p className="mt-2 text-xs leading-5 text-blue-200">Oxigenoterapia · Botucatu</p>
      </div>
      <nav aria-label="Menu principal" className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-blue-200/75 uppercase">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "mb-1 flex min-h-11 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-white text-[#173a63]"
                      : "text-blue-100 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/15 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-bold text-white">
            {initials(nome)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{nome || "Usuário"}</p>
            <p className="mt-1 text-[11px] text-blue-200">
              {roles.map((r) => roleLabels[r]).join(", ") || "Carregando perfil"}
            </p>
          </div>
          <button
            type="button"
            title="Sair do sistema"
            aria-label="Sair do sistema"
            onClick={() => void signOut()}
            className="ml-auto rounded-md p-2 text-blue-100 hover:bg-white/10"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <div className="municipal-logo mt-3">
          <img src="/saude-botucatu.png" alt="Secretaria de Saúde e Prefeitura de Botucatu" />
        </div>
      </div>
    </>
  );
  return (
    <div className="app-workspace min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[#123355] lg:flex">
        {navigation}
      </aside>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="flex w-[280px] flex-col gap-0 border-0 bg-[#123355] p-0 text-white"
        >
          <SheetTitle className="sr-only">Menu do sistema</SheetTitle>
          <SheetDescription className="sr-only">
            Navegação entre as áreas da Vital Air.
          </SheetDescription>
          {navigation}
        </SheetContent>
      </Sheet>
      <div className="min-w-0 lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex min-h-[72px] items-center gap-3 border-b bg-white px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-md border p-2 text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border bg-background px-3 text-left text-[13px] text-muted-foreground sm:max-w-md"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Buscar paciente, CPF ou documento</span>
          </button>
          <div className="ml-auto hidden text-right sm:block">
            <p className="text-xs font-semibold text-foreground">Secretaria Municipal de Saúde</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Botucatu · São Paulo</p>
          </div>
          <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">
            Homologação
          </span>
        </header>
        <main id="conteudo" className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
        <footer className="mx-4 border-t py-5 text-[11px] text-muted-foreground sm:mx-6 lg:mx-8">
          Vital Air · Gestão de oxigenoterapia domiciliar{" "}
          <span className="float-right hidden sm:inline">
            Secretaria Municipal de Saúde de Botucatu
          </span>
        </footer>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
