# QuímiLingo

Aplicação web gamificada (estilo Duolingo) para aprender química do básico ao intermediário: base atômica e funções inorgânicas.

**Jogue online:** https://sophia55hanna.github.io/quimilingo/

Cada push na branch `main` publica o site automaticamente no GitHub Pages (`.github/workflows/deploy.yml`).

**Stack:** React 18 + TypeScript + Vite · Tailwind CSS · lucide-react · LocalStorage

## Como rodar

```bash
npm install
npm run dev          # servidor de desenvolvimento em http://localhost:5173
npm run build        # typecheck + build de produção em dist/
npm run validate:data  # valida a integridade da base pedagógica
```

## Conteúdo

11 módulos · 28 lições · 184 exercícios em 4 formatos:

| Tipo | Interação |
| --- | --- |
| Múltipla escolha | 4 alternativas embaralhadas (atalhos de teclado 1–4) |
| Verdadeiro ou falso | Avaliação de afirmações |
| Preencher lacunas | Banco de termos clicáveis, incluindo fórmulas e equações |
| Associação de pares | Duas colunas embaralhadas; associação errada pisca em vermelho |

Fórmulas usam a notação `$...$` (`$H_2SO_4$`, `$SO_4^{2-}$`, `$Na^+$`) e são renderizadas com `<sub>`/`<sup>` reais pelo componente `ChemText`.

## Mecânicas de jogo

- **Vidas:** máximo de 15 (`MAX_HEARTS` em `GameContext.tsx`); cada erro em lição custa 1. Regeneram 1 a cada 30 min, e cada prática concluída devolve +1.
- **Fila de erros:** a questão errada volta para o fim da lição; a lição só termina quando todas forem acertadas.
- **XP:** 10 por lição nova (5 ao refazer) + bônus de precisão (+5 com 100%, +3 com ≥ 80%). Meta diária de 30 XP.
- **Ofensiva:** conta dias consecutivos de estudo (pelo fuso local); zera se você pular um dia.
- **Modo revisão:** os erros são salvos e podem ser praticados sem perder vidas; acertar remove a questão da lista.
- **Desbloqueio linear:** cada lição libera a seguinte. Concluir com 100% transforma o nó em uma coroa dourada.
- **Conquistas, histórico dos últimos 7 dias, efeitos sonoros (Web Audio API) e reset de progresso** na tela de Perfil.

Atalhos na lição: **Enter** verifica/continua, **Esc** pede para sair.

## Estrutura

```
src/
├── types/chemistry.ts              # Tipagens (Module, Lesson, Question, UserProgress...)
├── data/chemistryData.ts           # Base pedagógica + índices derivados
├── context/GameContext.tsx         # Estado global, regras de jogo e persistência
├── lib/                            # utils, sons, tema dos módulos, useNow
└── components/
    ├── Header.tsx / Navbar.tsx / SidePanel.tsx / ChemText.tsx
    ├── ui/DuoButton.tsx            # Botão tátil (border-b-4 + pressionado)
    ├── Map/LearningMap.tsx         # Trilha em zigue-zague
    ├── Lesson/                     # LessonView, QuestionCard, modais de vitória e sem vidas
    ├── Review/ReviewMode.tsx
    └── Profile/ProfileView.tsx
```

O progresso fica em `localStorage` sob a chave `quimilingo:progress:v1`. Dados lidos passam por validação: campos corrompidos voltam ao padrão e IDs de lições ou questões que não existem mais são descartados.
