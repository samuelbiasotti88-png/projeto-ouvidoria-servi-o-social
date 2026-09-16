import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/implantacoes")({
  head: () => ({
    meta: [
      { title: "Controle de implantações — Oxigenoterapia Botucatu" },
      {
        name: "description",
        content: "Agendamento e confirmação das implantações de oxigenoterapia domiciliar.",
      },
      { property: "og:title", content: "Controle de implantações" },
      {
        property: "og:description",
        content: "Implantações de oxigenoterapia domiciliar em Botucatu-SP.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ServicePage
        kind="installations"
        eyebrow="Operação"
        title="Controle de implantações"
        description="Da solicitação à instalação do equipamento no domicílio do paciente."
      />
    </AppShell>
  ),
});
