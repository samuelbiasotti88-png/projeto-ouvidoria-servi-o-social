import type { Database } from "@/integrations/supabase/types";

export type PatientStatus = Database["public"]["Enums"]["patient_status"];
export type ServiceStatus = Database["public"]["Enums"]["service_status"];
export type EquipmentStatus = Database["public"]["Enums"]["equipment_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export type Tone = "success" | "warning" | "critical" | "scheduled" | "closed" | "neutral";

export const patientStatusLabels: Record<PatientStatus, string> = {
  solicitacao_recebida: "Solicitação recebida",
  em_analise: "Em análise",
  aguardando_implantacao: "Aguardando implantação",
  implantacao_agendada: "Implantação agendada",
  implantacao_realizada: "Implantação realizada",
  oxigenio_ativo: "Oxigênio ativo",
  recarga_solicitada: "Recarga solicitada",
  recarga_agendada: "Recarga agendada",
  recarga_realizada: "Recarga realizada",
  retirada_solicitada: "Retirada solicitada",
  retirada_agendada: "Retirada agendada",
  retirada_realizada: "Retirada realizada",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export const patientStatusTone: Record<PatientStatus, Tone> = {
  solicitacao_recebida: "warning",
  em_analise: "warning",
  aguardando_implantacao: "warning",
  implantacao_agendada: "scheduled",
  implantacao_realizada: "success",
  oxigenio_ativo: "success",
  recarga_solicitada: "warning",
  recarga_agendada: "scheduled",
  recarga_realizada: "success",
  retirada_solicitada: "warning",
  retirada_agendada: "scheduled",
  retirada_realizada: "closed",
  encerrado: "closed",
  cancelado: "closed",
};

export const serviceStatusLabels: Record<ServiceStatus, string> = {
  solicitada: "Solicitada",
  agendada: "Agendada",
  realizada: "Realizada",
  nao_realizada: "Não realizada",
  cancelada: "Cancelada",
  atrasada: "Atrasada",
};

export const serviceStatusTone: Record<ServiceStatus, Tone> = {
  solicitada: "warning",
  agendada: "scheduled",
  realizada: "success",
  nao_realizada: "critical",
  cancelada: "closed",
  atrasada: "critical",
};

export const equipmentStatusLabels: Record<EquipmentStatus, string> = {
  disponivel: "Disponível",
  em_uso: "Em uso",
  em_manutencao: "Em manutenção",
  retirado: "Retirado",
  inativo: "Inativo",
};

export const equipmentStatusTone: Record<EquipmentStatus, Tone> = {
  disponivel: "success",
  em_uso: "scheduled",
  em_manutencao: "warning",
  retirado: "closed",
  inativo: "closed",
};

export const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  operador: "Operador",
  consulta: "Consulta",
  auditor: "Auditor",
};

export const serviceStatusOptions = Object.keys(serviceStatusLabels) as ServiceStatus[];
export const patientStatusOptions = Object.keys(patientStatusLabels) as PatientStatus[];

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value.length <= 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function formatCurrency(value?: number | null): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function initials(name?: string | null): string {
  if (!name) return "--";
  const clean = name.replace(/fict[íi]ci[oa]\s*/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "--";
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function maskPhone(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function csvEscape(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const body = [
    headers.map(csvEscape).join(";"),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(";")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function printReport() {
  window.print();
}
