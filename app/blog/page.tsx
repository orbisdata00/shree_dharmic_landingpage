import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import PostCard from "@/components/PostCard";
import { ContentUnavailable, listPosts, type ContentType, type PostPage } from "@/lib/contentApi";
import "../post-card.css";
import "./blog.css";

export const metadata: Metadata = {
  title: `Blog & Newsletters - ${BRAND.name}`,
  description: `Stories, news and newsletters from the ${BRAND.name}: Leela, festivals, seva and community updates.`,
  alternates: { canonical: "/blog" },
};

const TABS: [string, ContentType | undefined][] = [["All", undefined], ["Blog", "blog"], ["Newsletters", "newsletter"]];

function href(type: ContentType | undefined, page = 1) {
  const q = new URLSearchParams();
  if (type) q.set("type", type);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/blog?${s}` : "/blog";
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const type = sp.type === "blog" || sp.type === "newsletter" ? sp.type : undefined;
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);

  let data: PostPage | null = null;
  try {
    data = await listPosts({ type, page });
  } catch (e) {
    if (!(e instanceof ContentUnavailable)) throw e;
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar solid />
      <main id="main" className="blog">
        <section className="blog-hero">
          <img className="blog-hero__img" src="/assets/img/g-diyas.jpg" alt="" />
          <div className="blog-hero__overlay" />
          <div className="container">
            <p className="hero__label">॥ समाचार ॥</p>
            <h1>Blog &amp; <span>Newsletters</span></h1>
            <p>Stories from the Leela, festival news and updates from the committee.</p>
          </div>
        </section>

        <section className="blog-body">
          <div className="container">
            <nav className="blog-tabs" aria-label="Filter posts">
              {TABS.map(([label, t]) => (
                <Link key={label} href={href(t)} className={t === type ? "is-active" : undefined} aria-current={t === type ? "page" : undefined}>
                  {label}
                </Link>
              ))}
            </nav>

            {!data ? (
              <p className="blog-empty">Posts can’t be loaded right now. Please try again in a little while.</p>
            ) : data.items.length === 0 ? (
              <p className="blog-empty">No posts yet — check back soon.</p>
            ) : (
              <ul className="blog-grid">
                {data.items.map((p) => (
                  <li key={p.slug}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            )}

            {data && data.meta.total_pages > 1 && (
              <nav className="blog-pager" aria-label="Pages">
                {page > 1 ? <Link className="btn btn--outline btn--sm" href={href(type, page - 1)}>← Newer</Link> : <span />}
                <span>Page {page} of {data.meta.total_pages}</span>
                {page < data.meta.total_pages ? <Link className="btn btn--outline btn--sm" href={href(type, page + 1)}>Older →</Link> : <span />}
              </nav>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
