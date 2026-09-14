insert into public.companies (id, nome, cnpj, contato, telefone) values
('c0000000-0000-4000-8000-000000000001','OxiVida Gases Medicinais LTDA (fictícia)','11.111.111/0001-11','Central de Atendimento','(14) 3000-0001'),
('c0000000-0000-4000-8000-000000000002','RespirarBem Equipamentos (fictícia)','22.222.222/0001-22','Logística','(14) 3000-0002'),
('c0000000-0000-4000-8000-000000000003','AeroMed Suprimentos (fictícia)','33.333.333/0001-33','Comercial','(14) 3000-0003');

insert into public.patients (id, nome, cpf, cartao_sus, data_nascimento, telefone, responsavel, parentesco,
  cep, logradouro, numero, bairro, cidade, estado, tipo_equipamento, numero_equipamento, tipo_oxigenio,
  data_solicitacao, data_autorizacao, data_prevista_implantacao, data_implantacao, empresa_id,
  periodicidade_recarga_dias, ultima_recarga, proxima_recarga, status, observacoes) values
('a0000000-0000-4000-8000-000000000001','Fictícia Maria Aparecida Souza','111.111.111-11','700000000000001','1943-03-12','(14) 99999-0001','Fictício Pedro Souza','Filho','18600-001','Rua das Acácias','120','Centro','Botucatu','SP','Concentrador','EQ-001','Concentrador', current_date - 60, current_date - 58, current_date - 55, current_date - 55,'c0000000-0000-4000-8000-000000000001',30, current_date - 35, current_date - 5,'oxigenio_ativo','Paciente acamada.'),
('a0000000-0000-4000-8000-000000000002','Fictício João Batista Ferreira','222.222.222-22','700000000000002','1951-07-04','(14) 99999-0002','Fictícia Ana Ferreira','Esposa','18600-002','Av. Santana','450','Vila Santana','Botucatu','SP','Cilindro','EQ-002','Cilindro 10m³', current_date - 45, current_date - 44, current_date - 40, current_date - 40,'c0000000-0000-4000-8000-000000000001',20, current_date - 25, current_date - 5,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000003','Fictícia Luiza Oliveira Prado','333.333.333-33','700000000000003','1938-11-20','(14) 99999-0003','Fictícia Carla Prado','Neta','18600-003','Rua Amazonas','88','Jardim Paraíso','Botucatu','SP','Concentrador','EQ-003','Concentrador', current_date - 90, current_date - 88, current_date - 85, current_date - 85,'c0000000-0000-4000-8000-000000000002',30, current_date - 10, current_date + 20,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000004','Fictício Carlos Roberto Nunes','444.444.444-44','700000000000004','1947-01-30','(14) 99999-0004',null,null,'18600-004','Rua Bahia','77','Cohab','Botucatu','SP','Cilindro','EQ-004','Cilindro 7m³', current_date - 30, current_date - 29, current_date - 25, current_date - 25,'c0000000-0000-4000-8000-000000000001',15, current_date - 16, current_date - 1,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000005','Fictícia Rosa Maria Campos','555.555.555-55','700000000000005','1955-05-15','(14) 99999-0005','Fictício Luís Campos','Filho','18600-005','Rua Paraná','230','Jardim Peabiru','Botucatu','SP','Concentrador','EQ-005','Concentrador', current_date - 12, current_date - 10, current_date + 2, null,'c0000000-0000-4000-8000-000000000002',30, null, null,'implantacao_agendada',null),
('a0000000-0000-4000-8000-000000000006','Fictício Antônio Salles Alves','666.666.666-66','700000000000006','1940-09-09','(14) 99999-0006',null,null,'18600-006','Rua Goiás','15','Vila Assunção','Botucatu','SP','Cilindro','EQ-006','Cilindro 10m³', current_date - 200, current_date - 198, current_date - 195, current_date - 195,'c0000000-0000-4000-8000-000000000003',30, current_date - 40, current_date - 10,'retirada_agendada',null),
('a0000000-0000-4000-8000-000000000007','Fictícia Dulce Menezes Rocha','777.777.777-77','700000000000007','1962-02-02','(14) 99999-0007',null,null,'18600-007','Rua Ceará','300','Jardim Bela Vista','Botucatu','SP','Concentrador','EQ-007','Concentrador', current_date - 8, current_date - 6, current_date + 5, null,'c0000000-0000-4000-8000-000000000001',30, null, null,'aguardando_implantacao',null),
('a0000000-0000-4000-8000-000000000008','Fictício Sebastião Ramos','888.888.888-88','700000000000008','1949-12-25','(14) 99999-0008',null,null,'18600-008','Rua Piauí','44','Centro','Botucatu','SP','Cilindro','EQ-008','Cilindro 7m³', current_date - 150, current_date - 148, current_date - 145, current_date - 145,'c0000000-0000-4000-8000-000000000002',30, current_date - 28, current_date + 2,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000009','Fictícia Neusa Lopes Vieira','999.999.999-99','700000000000009','1936-06-18','(14) 99999-0009','Fictícia Ivone Vieira','Filha','18600-009','Rua Sergipe','901','Jardim Aeroporto','Botucatu','SP','Concentrador','EQ-009','Concentrador', current_date - 300, current_date - 298, current_date - 295, current_date - 295,'c0000000-0000-4000-8000-000000000001',30, current_date - 300, null,'encerrado','Caso encerrado.'),
('a0000000-0000-4000-8000-000000000010','Fictício Benedito Arruda','101.101.101-01','700000000000010','1958-08-08','(14) 99999-0010',null,null,'18600-010','Rua Alagoas','12','Vila dos Lavradores','Botucatu','SP','Cilindro','EQ-010','Cilindro 10m³', current_date - 20, current_date - 18, current_date - 15, current_date - 15,'c0000000-0000-4000-8000-000000000003',20, current_date - 15, current_date + 5,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000011','Fictícia Terezinha Moraes','111.222.333-44','700000000000011','1944-04-01','(14) 99999-0011',null,null,'18600-011','Rua Minas','65','Jardim Cristina','Botucatu','SP','Concentrador',null,'Concentrador', current_date - 5, null, null, null,'c0000000-0000-4000-8000-000000000001',30, null, null,'em_analise',null),
('a0000000-0000-4000-8000-000000000012','Fictício Jorge Tavares Pinto','222.333.444-55','700000000000012','1953-10-10','(14) 99999-0012',null,null,'18600-012','Rua Espírito Santo','210','Jardim Iolanda','Botucatu','SP','Cilindro','EQ-011','Cilindro 7m³', current_date - 70, current_date - 68, current_date - 65, current_date - 65,'c0000000-0000-4000-8000-000000000002',30, current_date - 32, current_date - 2,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000013','Fictícia Aparecida Bueno','333.444.555-66','700000000000013','1941-01-21','(14) 99999-0013',null,null,'18600-013','Rua Tocantins','7','Rubião Júnior','Botucatu','SP','Concentrador','EQ-012','Concentrador', current_date - 110, current_date - 108, current_date - 105, current_date - 105,'c0000000-0000-4000-8000-000000000001',30, current_date - 9, current_date + 21,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000014','Fictício Manoel Figueiredo','444.555.666-77','700000000000014','1950-03-03','(14) 99999-0014',null,null,'18600-014','Rua Pará','130','Vila Antártica','Botucatu','SP','Cilindro',null,'Cilindro 10m³', current_date - 3, null, null, null,'c0000000-0000-4000-8000-000000000003',30, null, null,'solicitacao_recebida',null),
('a0000000-0000-4000-8000-000000000015','Fictícia Iracema Duarte','555.666.777-88','700000000000015','1946-07-07','(14) 99999-0015',null,null,'18600-015','Rua Maranhão','56','Jardim Eldorado','Botucatu','SP','Concentrador','EQ-013','Concentrador', current_date - 180, current_date - 178, current_date - 175, current_date - 175,'c0000000-0000-4000-8000-000000000002',30, current_date - 31, current_date - 1,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000016','Fictício Orlando Bezerra','666.777.888-99','700000000000016','1939-09-29','(14) 99999-0016',null,null,'18600-016','Rua Roraima','19','Cohab I','Botucatu','SP','Cilindro','EQ-014','Cilindro 7m³', current_date - 240, current_date - 238, current_date - 235, current_date - 235,'c0000000-0000-4000-8000-000000000001',30, current_date - 20, current_date + 10,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000017','Fictícia Zilda Pacheco','777.888.999-00','700000000000017','1957-11-11','(14) 99999-0017',null,null,'18600-017','Rua Acre','82','Jardim Riviera','Botucatu','SP','Concentrador',null,'Concentrador', current_date - 6, current_date - 4, current_date + 3, null,'c0000000-0000-4000-8000-000000000003',30, null, null,'implantacao_agendada',null),
('a0000000-0000-4000-8000-000000000018','Fictício Valdir Camargo','888.999.000-11','700000000000018','1948-02-14','(14) 99999-0018',null,null,'18600-018','Rua Rondônia','24','Vila Real','Botucatu','SP','Cilindro','EQ-015','Cilindro 10m³', current_date - 130, current_date - 128, current_date - 125, current_date - 125,'c0000000-0000-4000-8000-000000000002',20, current_date - 22, current_date - 2,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000019','Fictícia Lourdes Batista','999.000.111-22','700000000000019','1952-06-06','(14) 99999-0019',null,null,'18600-019','Rua Amapá','9','Jardim Paraíso','Botucatu','SP','Concentrador','EQ-016','Concentrador', current_date - 95, current_date - 93, current_date - 90, current_date - 90,'c0000000-0000-4000-8000-000000000001',30, current_date - 12, current_date + 18,'oxigenio_ativo',null),
('a0000000-0000-4000-8000-000000000020','Fictício Nelson Quirino','000.111.222-33','700000000000020','1935-05-05','(14) 99999-0020',null,null,'18600-020','Rua Sergipe','410','Centro','Botucatu','SP','Cilindro',null,'Cilindro 7m³', current_date - 400, current_date - 398, current_date - 395, current_date - 395,'c0000000-0000-4000-8000-000000000003',30, current_date - 60, null,'retirada_realizada','Equipamento devolvido.');

insert into public.equipment (numero, tipo, modelo, empresa_id, status, paciente_id, data_entrega) values
('EQ-001','Concentrador','OxyPlus 5L','c0000000-0000-4000-8000-000000000001','em_uso','a0000000-0000-4000-8000-000000000001', current_date - 55),
('EQ-002','Cilindro','Cilindro 10m³','c0000000-0000-4000-8000-000000000001','em_uso','a0000000-0000-4000-8000-000000000002', current_date - 40),
('EQ-003','Concentrador','OxyPlus 10L','c0000000-0000-4000-8000-000000000002','em_uso','a0000000-0000-4000-8000-000000000003', current_date - 85),
('EQ-004','Cilindro','Cilindro 7m³','c0000000-0000-4000-8000-000000000001','em_uso','a0000000-0000-4000-8000-000000000004', current_date - 25),
('EQ-006','Cilindro','Cilindro 10m³','c0000000-0000-4000-8000-000000000003','em_uso','a0000000-0000-4000-8000-000000000006', current_date - 195),
('EQ-008','Cilindro','Cilindro 7m³','c0000000-0000-4000-8000-000000000002','em_uso','a0000000-0000-4000-8000-000000000008', current_date - 145),
('EQ-020','Concentrador','OxyPlus 5L','c0000000-0000-4000-8000-000000000001','disponivel',null,null),
('EQ-021','Concentrador','OxyPlus 10L','c0000000-0000-4000-8000-000000000002','disponivel',null,null),
('EQ-022','Cilindro','Cilindro 10m³','c0000000-0000-4000-8000-000000000003','em_manutencao',null,null),
('EQ-023','Cilindro','Cilindro 7m³','c0000000-0000-4000-8000-000000000001','retirado',null,null);

insert into public.installations (paciente_id, data_solicitacao, data_prevista, data_agendada, data_realizada, empresa_id, numero_equipamento, responsavel, status) values
('a0000000-0000-4000-8000-000000000001', current_date - 60, current_date - 56, current_date - 55, current_date - 55,'c0000000-0000-4000-8000-000000000001','EQ-001','Equipe A','realizada'),
('a0000000-0000-4000-8000-000000000002', current_date - 45, current_date - 41, current_date - 40, current_date - 40,'c0000000-0000-4000-8000-000000000001','EQ-002','Equipe B','realizada'),
('a0000000-0000-4000-8000-000000000005', current_date - 12, current_date + 2, current_date + 2, null,'c0000000-0000-4000-8000-000000000002',null,'Equipe A','agendada'),
('a0000000-0000-4000-8000-000000000007', current_date - 8, current_date - 2, null, null,'c0000000-0000-4000-8000-000000000001',null,null,'solicitada'),
('a0000000-0000-4000-8000-000000000017', current_date - 6, current_date + 3, current_date + 3, null,'c0000000-0000-4000-8000-000000000003',null,'Equipe C','agendada');

insert into public.refills (paciente_id, data_solicitacao, data_prevista, data_agendada, data_realizada, empresa_id, tipo_oxigenio, quantidade, numero_pedido, numero_os, numero_nota, status) values
('a0000000-0000-4000-8000-000000000001', current_date - 40, current_date - 35, current_date - 35, current_date - 35,'c0000000-0000-4000-8000-000000000001','Concentrador',1,'PED-1001','OS-2001','NF-3001','realizada'),
('a0000000-0000-4000-8000-000000000002', current_date - 28, current_date - 25, current_date - 25, current_date - 25,'c0000000-0000-4000-8000-000000000001','Cilindro 10m³',2,'PED-1002','OS-2002','NF-3002','realizada'),
('a0000000-0000-4000-8000-000000000004', current_date - 6, current_date - 1, null, null,'c0000000-0000-4000-8000-000000000001','Cilindro 7m³',2,'PED-1003',null,null,'atrasada'),
('a0000000-0000-4000-8000-000000000012', current_date - 7, current_date - 2, null, null,'c0000000-0000-4000-8000-000000000002','Cilindro 7m³',1,'PED-1004',null,null,'atrasada'),
('a0000000-0000-4000-8000-000000000015', current_date - 6, current_date - 1, current_date - 1, null,'c0000000-0000-4000-8000-000000000002','Concentrador',1,'PED-1005',null,null,'atrasada'),
('a0000000-0000-4000-8000-000000000008', current_date - 2, current_date + 2, current_date + 2, null,'c0000000-0000-4000-8000-000000000002','Cilindro 7m³',2,'PED-1006','OS-2006',null,'agendada'),
('a0000000-0000-4000-8000-000000000010', current_date - 1, current_date, current_date, null,'c0000000-0000-4000-8000-000000000003','Cilindro 10m³',2,'PED-1007',null,null,'agendada'),
('a0000000-0000-4000-8000-000000000013', current_date - 10, current_date - 9, current_date - 9, current_date - 9,'c0000000-0000-4000-8000-000000000001','Concentrador',1,'PED-1008','OS-2008','NF-3008','realizada'),
('a0000000-0000-4000-8000-000000000016', current_date - 21, current_date - 20, current_date - 20, current_date - 20,'c0000000-0000-4000-8000-000000000001','Cilindro 7m³',2,'PED-1009','OS-2009','NF-3009','realizada'),
('a0000000-0000-4000-8000-000000000019', current_date - 13, current_date - 12, current_date - 12, current_date - 12,'c0000000-0000-4000-8000-000000000001','Concentrador',1,'PED-1010','OS-2010','NF-3010','realizada');

insert into public.removals (paciente_id, data_solicitacao, motivo, data_prevista, data_agendada, data_realizada, empresa_id, numero_equipamento, responsavel, status) values
('a0000000-0000-4000-8000-000000000006', current_date - 10,'Alta clínica', current_date + 1, current_date + 1, null,'c0000000-0000-4000-8000-000000000003','EQ-006','Equipe B','agendada'),
('a0000000-0000-4000-8000-000000000020', current_date - 65,'Óbito', current_date - 60, current_date - 60, current_date - 60,'c0000000-0000-4000-8000-000000000003',null,'Equipe A','realizada'),
('a0000000-0000-4000-8000-000000000009', current_date - 300,'Alta clínica', current_date - 296, current_date - 296, current_date - 295,'c0000000-0000-4000-8000-000000000001','EQ-009','Equipe C','realizada'),
('a0000000-0000-4000-8000-000000000018', current_date - 4,'Transferência de município', current_date - 1, current_date - 1, null,'c0000000-0000-4000-8000-000000000002','EQ-015',null,'nao_realizada'),
('a0000000-0000-4000-8000-000000000003', current_date - 2,'Reavaliação médica', current_date + 5, null, null,'c0000000-0000-4000-8000-000000000002',null,null,'solicitada');

insert into public.documents (paciente_id, tipo, numero, data, empresa_id, valor, servico, conferido, divergencia) values
('a0000000-0000-4000-8000-000000000001','nota_fiscal','NF-3001', current_date - 34,'c0000000-0000-4000-8000-000000000001',480.00,'Recarga de oxigênio', true, null),
('a0000000-0000-4000-8000-000000000002','nota_fiscal','NF-3002', current_date - 23,'c0000000-0000-4000-8000-000000000001',760.00,'Recarga de oxigênio', false,'Data da nota difere da recarga registrada (2 dias).'),
('a0000000-0000-4000-8000-000000000013','nota_fiscal','NF-3008', current_date - 9,'c0000000-0000-4000-8000-000000000001',480.00,'Recarga de oxigênio', true, null),
('a0000000-0000-4000-8000-000000000016','ordem_servico','OS-2009', current_date - 20,'c0000000-0000-4000-8000-000000000001',0,'Entrega de cilindros', false, null),
('a0000000-0000-4000-8000-000000000019','nota_fiscal','NF-3010', current_date - 11,'c0000000-0000-4000-8000-000000000001',520.00,'Recarga de oxigênio', false,'Valor divergente do pedido PED-1010.');

insert into public.occurrences (paciente_id, titulo, descricao, gravidade, situacao) values
('a0000000-0000-4000-8000-000000000004','Recarga não entregue','Família relatou ausência da entrega prevista.','alta','aberta'),
('a0000000-0000-4000-8000-000000000012','Equipamento com ruído','Solicitada avaliação técnica da empresa.','media','aberta'),
('a0000000-0000-4000-8000-000000000018','Retirada não realizada','Endereço não localizado pela equipe.','media','aberta'),
('a0000000-0000-4000-8000-000000000015','Cadastro incompleto','Falta cartão SUS atualizado.','baixa','aberta');

insert into public.patient_history (paciente_id, evento, detalhe, categoria, ocorrido_em)
select id, 'Solicitação cadastrada', 'Registro inicial no sistema', 'solicitacao', (coalesce(data_solicitacao, current_date))::timestamptz from public.patients;
insert into public.patient_history (paciente_id, evento, detalhe, categoria, ocorrido_em)
select id, 'Implantação realizada', 'Equipamento ' || coalesce(numero_equipamento,'—') || ' instalado', 'implantacao', data_implantacao::timestamptz
from public.patients where data_implantacao is not null;
insert into public.patient_history (paciente_id, evento, detalhe, categoria, ocorrido_em)
select paciente_id, 'Recarga realizada', 'Nota ' || coalesce(numero_nota,'—'), 'recarga', data_realizada::timestamptz
from public.refills where data_realizada is not null;
