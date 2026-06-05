/** Простой markdown → HTML для статей блога (заголовки, списки, таблицы, ссылки, bold) */

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

function parseInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-wood underline underline-offset-4 hover:opacity-80 transition-opacity">$1</a>',
    );
}

function isTableRow(line: string) {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((c) => c.trim());
}

function isSeparatorRow(cells: string[]) {
  return cells.every((c) => /^:?-+:?$/.test(c.replace(/\s/g, "")));
}

export function markdownToHtml(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let i = 0;
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (isTableRow(line) && i + 1 < lines.length && isTableRow(lines[i + 1])) {
      closeList();
      const headerCells = parseTableRow(line);
      const sepCells = parseTableRow(lines[i + 1]);
      if (isSeparatorRow(sepCells)) {
        out.push('<div class="my-6 overflow-x-auto"><table class="w-full text-sm border-collapse">');
        out.push("<thead><tr>");
        headerCells.forEach((c) => {
          out.push(`<th class="border border-graphite/15 bg-muted-bg px-4 py-2 text-left font-medium">${parseInline(c)}</th>`);
        });
        out.push("</tr></thead><tbody>");
        i += 2;
        while (i < lines.length && isTableRow(lines[i])) {
          const cells = parseTableRow(lines[i]);
          out.push("<tr>");
          cells.forEach((c) => {
            out.push(`<td class="border border-graphite/15 px-4 py-2 text-muted">${parseInline(c)}</td>`);
          });
          out.push("</tr>");
          i++;
        }
        out.push("</tbody></table></div>");
        continue;
      }
    }

    if (line.startsWith("## ")) {
      closeList();
      const title = line.slice(3);
      const id = slugifyHeading(title);
      out.push(`<h2 id="${id}">${parseInline(title)}</h2>`);
      i++;
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        out.push('<ul class="list-disc pl-6 my-4 space-y-1">');
        inList = true;
      }
      out.push(`<li>${parseInline(line.slice(2))}</li>`);
      i++;
      continue;
    }

    closeList();

    if (line.trim()) {
      out.push(`<p>${parseInline(line)}</p>`);
    }
    i++;
  }

  closeList();
  return out.join("");
}
