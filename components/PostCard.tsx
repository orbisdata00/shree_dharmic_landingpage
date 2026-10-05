import Link from "next/link";
import { TYPE_LABEL, formatPostDate, type PostSummary } from "@/lib/contentApi";

/** Blog/newsletter card (styles: app/post-card.css). `heading` keeps the outline right per page. */
export default function PostCard({ post, heading: H = "h2" }: { post: PostSummary; heading?: "h2" | "h3" }) {
  return (
    <article className="blog-card">
      <Link href={`/blog/${post.slug}`} className="blog-card__link">
        <div className="blog-card__media">
          {post.featured_image_url ? (
            <img src={post.featured_image_url} alt="" loading="lazy" />
          ) : (
            <img src="/assets/img/g-diyas.jpg" alt="" loading="lazy" className="is-fallback" />
          )}
        </div>
        <div className="blog-card__body">
          <p className="blog-meta">
            <span className="blog-tag">{TYPE_LABEL[post.content_type]}</span>
            <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>
          </p>
          <H>{post.title}</H>
          {post.excerpt && <p className="blog-card__excerpt">{post.excerpt}</p>}
          <span className="blog-card__more">Read more <span className="arrow" aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}
