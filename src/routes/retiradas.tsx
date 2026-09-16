import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/retiradas")({
  head: () => ({
    meta: [
      { title: "Controle de retiradas — Oxigenoterapia Botucatu" },
      {
        name: "description",
        content: "Retiradas de equipamentos de oxigenoterapia e encerramento de casos.",
      },
      { property: "og:title", content: "Controle de retiradas" },
      {
        property: "og:description",
        content: "Retiradas de equipamentos de oxigenoterapia em Botucatu-SP.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ServicePage
        kind="removals"
        eyebrow="Operação"
        title="Controle de retiradas"
        description="Retirada de equipamentos, motivo, responsável e encerramento do caso."
      />
    </AppShell>
  ),
});
