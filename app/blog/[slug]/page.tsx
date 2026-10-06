import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { ContentUnavailable, TYPE_LABEL, formatPostDate, getPost, listAllPosts } from "@/lib/contentApi";
import "../../post-card.css";
import "../blog.css";

// Static export: one page per post published at build time; other slugs are 404s until the next build.
export const dynamicParams = false;

export async function generateStaticParams() {
  let slugs: string[] = [];
  try {
    slugs = (await listAllPosts()).map((p) => p.slug);
  } catch (e) {
    if (!(e instanceof ContentUnavailable)) throw e;
  }
  // Static export refuses an empty list; "_none" fails getPost's slug check, so it renders as a 404.
  return (slugs.length ? slugs : ["_none"]).map((slug) => ({ slug }));
}

// Social networks build link previews from these tags when the post is shared (e.g. by the Zapier automation).
export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: `Not found - ${BRAND.name}` };
  const description = post.excerpt ?? undefined;
  const images = post.featured_image_url ? [{ url: post.featured_image_url, alt: post.title }] : undefined;
  return {
    title: `${post.title} - ${BRAND.name}`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      siteName: BRAND.name,
      title: post.title,
      description,
      images,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: post.author_name ? [post.author_name] : undefined,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: post.title, description, images },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar solid />
      <main id="main" className="blog">
        <article>
          <header className="blog-hero blog-hero--post">
            <img className="blog-hero__img" src={post.featured_image_url ?? "/assets/img/g-diyas.jpg"} alt="" />
            <div className="blog-hero__overlay" />
            <div className="container">
              <p className="blog-meta blog-meta--light">
                <span className="blog-tag">{TYPE_LABEL[post.content_type]}</span>
                <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>
                {post.author_name && <span>· {post.author_name}</span>}
              </p>
              <h1>{post.title}</h1>
              {post.excerpt && <p>{post.excerpt}</p>}
            </div>
          </header>

          <div className="blog-body">
            <div className="container">
              {/* body_html is sanitised by the backend (allow-listed tags, no scripts/handlers/iframes). */}
              <div className="blog-article" dangerouslySetInnerHTML={{ __html: post.body_html }} />
              <p className="blog-back">
                <Link href="/blog" className="btn btn--outline btn--sm">← All posts</Link>
              </p>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
