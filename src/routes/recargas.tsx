import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/recargas")({
  head: () => ({
    meta: [
      { title: "Controle de recargas — Oxigenoterapia Botucatu" },
      {
        name: "description",
        content: "Solicitações, agendamentos e confirmações de recargas de oxigênio domiciliar.",
      },
      { property: "og:title", content: "Controle de recargas" },
      { property: "og:description", content: "Recargas de oxigênio domiciliar em Botucatu-SP." },
    ],
  }),
  component: () => (
    <AppShell>
      <ServicePage
        kind="refills"
        eyebrow="Operação"
        title="Controle de recargas"
        description="Acompanhe solicitações, agendamentos, entregas e notas de cada recarga."
      />
    </AppShell>
  ),
});
