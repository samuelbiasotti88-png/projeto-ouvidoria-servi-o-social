import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  Gauge,
  HeartPulse,
  Home,
  LogOut,
  Search,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { initials, roleLabels } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/GlobalSearch";

const navGroups = [
  {
    label: "Operação",
    items: [
      { to: "/", label: "Painel", icon: Home },
      { to: "/pacientes", label: "Pacientes", icon: Users },
      { to: "/implantacoes", label: "Implantações", icon: HeartPulse },
      { to: "/recargas", label: "Recargas", icon: Activity },
      { to: "/retiradas", label: "Retiradas", icon: Truck },
    ],
  },
  {
    label: "Organização",
    items: [
      { to: "/agenda", label: "Agenda", icon: CalendarDays },
      { to: "/equipamentos", label: "Equipamentos", icon: Wrench },
      { to: "/documentos", label: "Notas e documentos", icon: FileText },
      { to: "/pendencias", label: "Pendências", icon: ClipboardList },
    ],
  },
  {
    label: "Gestão",
    items: [
      { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
      { to: "/indicadores", label: "Indicadores", icon: Gauge },
      { to: "/auditoria", label: "Auditoria", icon: ShieldCheck },
      { to: "/usuarios", label: "Usuários", icon: Bell },
    ],
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading, nome, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) {
      void navigate({ to: "/auth" });
    }
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando o sistema…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px]">
      <aside className="glass-soft sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r px-4 py-6 md:flex">
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-brand)]">
            <span className="font-display text-lg font-bold">O₂</span>
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold">Oxigenoterapia</p>
            <p className="text-[11px] text-muted-foreground">Saúde · Botucatu-SP</p>
          </div>
        </div>

        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pt-3 pb-1 text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-primary font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent/60",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="glass-soft mt-auto rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/25 text-xs font-bold text-accent-foreground">
              {initials(nome)}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-semibold">{nome || "Usuário"}</p>
              <p className="text-[10px] text-muted-foreground">
                {roles.map((r) => roleLabels[r]).join(", ") || "Sem perfil"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="size-3.5" aria-hidden /> Sair
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 px-4 py-6 lg:px-8">
        <div className="mb-4 flex items-center gap-3 md:hidden">
          <span className="font-display text-sm font-bold">Oxigenoterapia · Botucatu-SP</span>
        </div>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="glass-soft mb-6 flex w-full max-w-md items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground"
        >
          <Search className="size-4" aria-hidden />
          Buscar paciente, CPF, equipamento ou nota…
        </button>
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
        {children}
      </div>
    </div>
  );
}
