import { Fragment, type ReactNode } from 'react';

/**
 * Renderiza texto com fórmulas químicas delimitadas por `$...$`.
 * Dentro da fórmula: `_2` ou `_{12}` → subscrito; `^+`, `^{2-}` → sobrescrito.
 */
function renderFormula(source: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buffer = '';
  let i = 0;

  const flush = () => {
    if (buffer) {
      nodes.push(buffer);
      buffer = '';
    }
  };

  while (i < source.length) {
    const char = source[i];
    if ((char === '_' || char === '^') && i + 1 < source.length) {
      flush();
      let content: string;
      if (source[i + 1] === '{') {
        const end = source.indexOf('}', i + 2);
        const stop = end === -1 ? source.length : end;
        content = source.slice(i + 2, stop);
        i = stop + 1;
      } else {
        const allowed = char === '_' ? /[0-9]/ : /[0-9+\-]/;
        let j = i + 1;
        while (j < source.length && allowed.test(source[j])) j++;
        if (j === i + 1) j = i + 2;
        content = source.slice(i + 1, j);
        i = j;
      }
      const key = `${keyPrefix}-${nodes.length}`;
      nodes.push(
        char === '_' ? (
          <sub key={key} className="text-[0.7em] leading-none">
            {content}
          </sub>
        ) : (
          <sup key={key} className="text-[0.7em] leading-none">
            {content.replace(/-/g, '−')}
          </sup>
        ),
      );
      continue;
    }
    buffer += char;
    i++;
  }
  flush();
  return nodes;
}

interface ChemTextProps {
  text: string;
  className?: string;
}

export function ChemText({ text, className }: ChemTextProps) {
  const parts = text.split('$');
  return (
    <span className={className}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="whitespace-nowrap font-bold tracking-tight">
            {renderFormula(part, `f${index}`)}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
