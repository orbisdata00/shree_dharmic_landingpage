/**
 * Server-side reads of published blog posts and newsletters from the backend's public
 * content API (backend-shree-dharmic: GET /api/v1/content, GET /api/v1/content/{slug}).
 * Only published, already-live posts are returned; `body_html` is sanitised by the backend.
 *
 * The site is a static export, so these run only during `next build`: a newly published post
 * appears on the site after the next build.
 */

import { API_BASE } from "./membershipApi";

export type ContentType = "blog" | "newsletter";

export type PostSummary = {
  content_type: ContentType;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  published_at: string;
};

export type Post = PostSummary & { body_html: string; updated_at: string };

export type PostPage = {
  items: PostSummary[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
};

export class ContentUnavailable extends Error {}

async function getJson<T>(path: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1${path}`);
  } catch {
    throw new ContentUnavailable("The content service could not be reached.");
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new ContentUnavailable(`The content service responded with ${res.status}.`);
  return res.json() as Promise<T>;
}

export async function listPosts({ type, page = 1, pageSize = 9 }: { type?: ContentType; page?: number; pageSize?: number }) {
  const q = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (type) q.set("content_type", type);
  return (await getJson<PostPage>(`/content?${q}`)) ?? { items: [], meta: { page, page_size: pageSize, total: 0, total_pages: 0 } };
}

/** Every published post, newest first (walks all pages of the list endpoint). */
export async function listAllPosts(): Promise<PostSummary[]> {
  const first = await listPosts({ page: 1, pageSize: 50 });
  const items = [...first.items];
  for (let page = 2; page <= first.meta.total_pages; page++) {
    items.push(...(await listPosts({ page, pageSize: 50 })).items);
  }
  return items;
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null; // same rule as the backend's slugs
  return getJson<Post>(`/content/${slug}`);
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}

export const TYPE_LABEL: Record<ContentType, string> = { blog: "Blog", newsletter: "Newsletter" };
