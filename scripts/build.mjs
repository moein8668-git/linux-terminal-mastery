import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { marked } from "marked";

const root = new URL("..", import.meta.url).pathname;
const contentRoot = join(root, "Linux-Terminal-Mastery-FA", "Persian");
const sourceRoot = join(root, "site");
const outputRoot = join(root, "dist");

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const slugify = (value) => value
  .toString()
  .trim()
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, "-")
  .replace(/^-+|-+$/g, "") || "section";

const titleFromMarkdown = (markdown, fallback) =>
  markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback;

const tagList = (folder, title) => {
  const values = new Set(["linux", "terminal"]);
  for (const word of `${folder} ${title}`.split(/[\s_-]+/u)) {
    const clean = word.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
    if (clean.length >= 3) values.add(clean);
  }
  return [...values].slice(0, 8);
};

const entries = (await readdir(contentRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  .map((entry, index, all) => ({ folder: entry.name, index, all }));

const chapters = [];
for (const entry of entries) {
  const markdown = await readFile(join(contentRoot, entry.folder, "README.md"), "utf8");
  const title = titleFromMarkdown(markdown, entry.folder);
  chapters.push({
    ...entry,
    title,
    slug: slugify(entry.folder),
    tags: tagList(entry.folder, title),
    markdown
  });
}

marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const id = slugify(text.replace(/<[^>]+>/g, ""));
      return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    }
  }
});

const template = await readFile(join(sourceRoot, "template.html"), "utf8");
await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(join(sourceRoot, "styles.css"), join(outputRoot, "styles.css"));
await cp(join(sourceRoot, "app.js"), join(outputRoot, "app.js"));
await cp(join(root, "Assets"), join(outputRoot, "Assets"), { recursive: true });

const nav = chapters.map((chapter) => `
      <li><a href="{{BASE}}chapters/${chapter.slug}/" data-chapter="${chapter.slug}" data-tags="${chapter.tags.join(",")}">
        <span class="branch">${chapter.index === chapters.length - 1 ? "└──" : "├──"}</span>
        <span>${escapeHtml(chapter.folder)}<small>${escapeHtml(chapter.title)}</small></span>
      </a></li>`).join("");

const tagButtons = [...new Set(chapters.flatMap((chapter) => chapter.tags))]
  .sort((a, b) => a.localeCompare(b))
  .map((tag) => `<button class="tag-filter" type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`)
  .join("");

const renderPage = (chapter, content, base) => template
  .replaceAll("{{TITLE}}", escapeHtml(chapter?.title || "Linux Terminal Mastery"))
  .replaceAll("{{BASE}}", base)
  .replaceAll("{{CHAPTER_NAV}}", nav.replaceAll("{{BASE}}", base))
  .replaceAll("{{TAG_FILTERS}}", tagButtons)
  .replaceAll("{{CHAPTER_SLUG}}", chapter?.slug || "")
  .replaceAll("{{CHAPTER_FILE}}", chapter ? `${chapter.folder}/README.md` : "README.md")
  .replaceAll("{{TAGS}}", chapter ? chapter.tags.map((tag) => `<span class="tag" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</span>`).join("") : "")
  .replace("{{CONTENT}}", content);

for (const chapter of chapters) {
  const content = marked.parse(chapter.markdown.replaceAll(/\]\(\.\.\/\.\.\/\.\.\/Assets\//g, "](/Assets/"));
  const dir = join(outputRoot, "chapters", chapter.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), renderPage(chapter, content, "../../"));
}

const landing = `<section class="landing" dir="rtl">
  <h1>Linux Terminal Mastery</h1>
  <p>دوره جامع لینوکس، از مفاهیم پایه تا مدیریت حرفه‌ای سیستم.</p>
  <div class="chapter-grid">${chapters.map((chapter) => `
    <a class="chapter-card" href="chapters/${chapter.slug}/">
      <span class="card-number">${String(chapter.index).padStart(2, "0")}</span>
      <span><strong>${escapeHtml(chapter.title)}</strong><small>${escapeHtml(chapter.folder)}</small></span>
    </a>`).join("")}</div>
</section>`;
await writeFile(join(outputRoot, "index.html"), renderPage(null, landing, ""));

console.log(`Built ${chapters.length} chapters in ${relative(root, outputRoot)}/`);
