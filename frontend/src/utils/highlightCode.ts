import type { CodeLanguage, EditorTheme } from '@/types/workspaceCode.type';

const JS_KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do', 'else',
  'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
  'let', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
  'undefined', 'var', 'void', 'while', 'await', 'async', 'from', 'of', 'yield',
]);

const TS_KEYWORDS = new Set([
  ...JS_KEYWORDS,
  'interface', 'type', 'enum', 'public', 'private', 'protected', 'static', 'implements', 'readonly',
  'declare', 'namespace', 'abstract', 'as', 'satisfies', 'keyof', 'infer',
]);

const PYTHON_KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
  'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
  'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while',
  'with', 'yield',
]);

const JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
  'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
  'volatile', 'while', 'true', 'false', 'null',
]);

const LANGUAGE_KEYWORDS: Record<Exclude<CodeLanguage, 'markdown' | 'plain'>, Set<string>> = {
  javascript: JS_KEYWORDS,
  typescript: TS_KEYWORDS,
  python: PYTHON_KEYWORDS,
  java: JAVA_KEYWORDS,
};

const PALETTES = {
  dark: {
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    number: '#b5cea8',
    markdown: '#d2a8ff',
  },
  light: {
    keyword: '#0550ae',
    string: '#0a3069',
    comment: '#116329',
    number: '#0550ae',
    markdown: '#8250df',
  },
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(style: string, value: string): string {
  return `<span style="color:${style}">${escapeHtml(value)}</span>`;
}

function highlightWithKeywords(
  code: string,
  keywords: Set<string>,
  palette: (typeof PALETTES)[EditorTheme],
  options: { hashComment?: boolean } = {},
): string {
  let result = '';
  let index = 0;

  while (index < code.length) {
    const rest = code.slice(index);

    if (options.hashComment && rest.startsWith('#')) {
      const end = code.indexOf('\n', index);
      const commentEnd = end === -1 ? code.length : end;
      result += wrap(palette.comment, code.slice(index, commentEnd));
      index = commentEnd;
      continue;
    }

    if (rest.startsWith('//')) {
      const end = code.indexOf('\n', index);
      const commentEnd = end === -1 ? code.length : end;
      result += wrap(palette.comment, code.slice(index, commentEnd));
      index = commentEnd;
      continue;
    }

    if (rest.startsWith('/*')) {
      const end = code.indexOf('*/', index + 2);
      const commentEnd = end === -1 ? code.length : end + 2;
      result += wrap(palette.comment, code.slice(index, commentEnd));
      index = commentEnd;
      continue;
    }

    const stringMatch = rest.match(/^(['"`])(?:\\.|(?!\1)[^\\])*\1/);
    if (stringMatch) {
      result += wrap(palette.string, stringMatch[0]);
      index += stringMatch[0].length;
      continue;
    }

    const numberMatch = rest.match(/^\b\d+(?:\.\d+)?\b/);
    if (numberMatch) {
      result += wrap(palette.number, numberMatch[0]);
      index += numberMatch[0].length;
      continue;
    }

    const wordMatch = rest.match(/^[A-Za-z_$][\w$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (keywords.has(word)) {
        result += wrap(palette.keyword, word);
      } else {
        result += escapeHtml(word);
      }
      index += word.length;
      continue;
    }

    result += escapeHtml(code[index]);
    index += 1;
  }

  return result;
}

function highlightMarkdown(code: string, palette: (typeof PALETTES)[EditorTheme]): string {
  return code
    .split('\n')
    .map((line) => {
      const headingMatch = line.match(/^(#{1,6}\s+)(.*)$/);
      if (headingMatch) {
        return `${wrap(palette.markdown, headingMatch[1])}${escapeHtml(headingMatch[2])}`;
      }

      return line.replace(/(`[^`]+`)/g, (match) => wrap(palette.string, match));
    })
    .join('\n');
}

export function highlightCode(
  code: string,
  language: CodeLanguage = 'plain',
  theme: EditorTheme = 'dark',
): string {
  const palette = PALETTES[theme];

  if (language === 'plain') {
    return escapeHtml(code);
  }

  if (language === 'markdown') {
    return highlightMarkdown(code, palette);
  }

  const keywords = LANGUAGE_KEYWORDS[language];
  return highlightWithKeywords(code, keywords, palette, {
    hashComment: language === 'python',
  });
}
