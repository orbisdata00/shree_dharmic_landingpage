"use client";

import { useState } from "react";
import PostCard from "@/components/PostCard";
import type { ContentType, PostSummary } from "@/lib/contentApi";

const TABS: [string, ContentType | undefined][] = [["All", undefined], ["Blog", "blog"], ["Newsletters", "newsletter"]];
const PAGE_SIZE = 9;

/** /blog grid with type tabs and paging. The page is static, so filtering happens in the browser. */
export default function BlogList({ posts }: { posts: PostSummary[] }) {
  const [type, setType] = useState<ContentType | undefined>();
  const [page, setPage] = useState(1);

  const shown = type ? posts.filter((p) => p.content_type === type) : posts;
  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const items = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goTo = (n: number) => {
    setPage(n);
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav className="blog-tabs" aria-label="Filter posts">
        {TABS.map(([label, t]) => (
          <button
            key={label}
            type="button"
            className={t === type ? "is-active" : undefined}
            aria-pressed={t === type}
            onClick={() => { setType(t); setPage(1); }}
          >
            {label}
          </button>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="blog-empty">No posts yet — check back soon.</p>
      ) : (
        <ul className="blog-grid">
          {items.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="blog-pager" aria-label="Pages">
          {page > 1 ? <button type="button" className="btn btn--outline btn--sm" onClick={() => goTo(page - 1)}>← Newer</button> : <span />}
          <span>Page {page} of {totalPages}</span>
          {page < totalPages ? <button type="button" className="btn btn--outline btn--sm" onClick={() => goTo(page + 1)}>Older →</button> : <span />}
        </nav>
      )}
    </>
  );
}
