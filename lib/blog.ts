import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  readingTime: number;
}

export interface Post extends PostMeta {
  html: string;
}

/** Roughly 200 words a minute, rounded up, minimum one. */
function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function toMeta(slug: string, data: Record<string, unknown>, content: string): PostMeta {
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    author: String(data.author ?? "Next Solutions"),
    category: String(data.category ?? "Nieuws"),
    readingTime: readingTime(content),
  };
}

/** Newest first. Returns an empty list when the folder does not exist. */
export async function getPosts(): Promise<PostMeta[]> {
  let files: string[];
  try {
    files = await fs.readdir(POSTS_DIR);
  } catch {
    return [];
  }

  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith(".md"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
        const { data, content } = matter(raw);
        return toMeta(file.replace(/\.md$/, ""), data, content);
      }),
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  // Guard against a slug that tries to climb out of the content folder.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  try {
    const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.md`), "utf8");
    const { data, content } = matter(raw);
    const processed = await remark().use(html).process(content);
    return { ...toMeta(slug, data, content), html: processed.toString() };
  } catch {
    return null;
  }
}

export function formatDate(iso: string, locale: "nl" | "en" = "nl"): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "nl-NL", { day: "numeric", month: "long", year: "numeric" });
}
