import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { patientStatusLabels } from "@/lib/domain";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  const { data: patients = [] } = useQuery({
    queryKey: ["busca-pacientes", term],
    enabled: open && term.trim().length >= 2,
    queryFn: async () => {
      const like = `%${term.trim()}%`;
      const { data, error } = await supabase
        .from("patients")
        .select("id, nome, cpf, cartao_sus, status, numero_equipamento, bairro, telefone")
        .or(
          `nome.ilike.${like},cpf.ilike.${like},cartao_sus.ilike.${like},telefone.ilike.${like},numero_equipamento.ilike.${like},bairro.ilike.${like},logradouro.ilike.${like}`,
        )
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: refills = [] } = useQuery({
    queryKey: ["busca-recargas", term],
    enabled: open && term.trim().length >= 2,
    queryFn: async () => {
      const like = `%${term.trim()}%`;
      const { data, error } = await supabase
        .from("refills")
        .select("id, paciente_id, numero_nota, numero_pedido, numero_os")
        .or(`numero_nota.ilike.${like},numero_pedido.ilike.${like},numero_os.ilike.${like}`)
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Nome, CPF, cartão SUS, telefone, equipamento, nota ou pedido…"
        value={term}
        onValueChange={setTerm}
      />
      <CommandList>
        <CommandEmpty>Digite ao menos 2 caracteres para pesquisar.</CommandEmpty>
        {patients.length > 0 ? (
          <CommandGroup heading="Pacientes">
            {patients.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.nome} ${p.cpf ?? ""}`}
                onSelect={() => {
                  onOpenChange(false);
                  void navigate({ to: "/pacientes/$id", params: { id: p.id } });
                }}
              >
                <span className="font-medium">{p.nome}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {p.cpf ?? "sem CPF"} · {patientStatusLabels[p.status]}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {refills.length > 0 ? (
          <CommandGroup heading="Recargas / notas">
            {refills.map((r) => (
              <CommandItem
                key={r.id}
                value={`${r.numero_nota ?? ""} ${r.numero_pedido ?? ""} ${r.id}`}
                onSelect={() => {
                  onOpenChange(false);
                  void navigate({ to: "/pacientes/$id", params: { id: r.paciente_id } });
                }}
              >
                Nota {r.numero_nota ?? "—"} · Pedido {r.numero_pedido ?? "—"}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
