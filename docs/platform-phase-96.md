# DUQUE Score Platform - Phase 96

## Objetivo

Validar a configuracao operacional do backend antes da abertura da porta HTTP, impedindo inicializacoes silenciosas com porta, host ou CORS incorretos.

## Entrega

- Fronteira unica para leitura das variaveis do backend.
- Configuracao final imutavel.
- Validacao de `API_PORT` entre 1 e 65535.
- Validacao de `API_HOST` como localhost ou endereco IP.
- Allowlist CORS restrita a origens HTTP/HTTPS sem caminho, consulta, fragmento ou credenciais.
- Rejeicao explicita de wildcard `*`.
- Remocao de duplicatas e normalizacao das origens.
- Lista CORS vazia permitida para operacao sem navegador.
- Erros agregados com codigos e nomes de campos controlados.
- Formatacao correta de endereco IPv4, IPv6 e localhost.
- Arquivo `.env.backend.example` sem segredos.
- Testes unitarios para defaults, limites e entradas inseguras.
- A versao do Engine permanece na Fase 89.

## Uso local

O Node.js nao carrega o arquivo de exemplo automaticamente. As variaveis podem ser definidas no terminal antes de executar `npm run dev:api`; sem variaveis, defaults locais seguros sao utilizados.

## Limites da versao

- Nao foi adicionada dependencia para carregar arquivos `.env`.
- Configuracao de banco, provedor e autenticacao ainda nao existe.
- Host de dominio nao e aceito para bind; deployments devem usar o IP de bind fornecido pela plataforma, normalmente `0.0.0.0`.
- TLS continua responsabilidade do proxy ou plataforma de hospedagem.

## Proxima fase recomendada

Extrair a composicao do processo HTTP para uma funcao de bootstrap testavel, adicionando tratamento explicito de erro de porta e encerramento gracioso por sinais do sistema.
