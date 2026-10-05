import Link from "next/link";
import PostCard from "@/components/PostCard";
import { ContentUnavailable, listPosts, type PostSummary } from "@/lib/contentApi";

/**
 * Home page "From the Blog" section: the three newest blog posts / newsletters.
 * Renders nothing when there are no posts yet or the backend can't be reached,
 * so the home page never breaks because of it.
 */
export default async function LatestPosts() {
  let posts: PostSummary[] = [];
  try {
    posts = (await listPosts({ pageSize: 3 })).items;
  } catch (e) {
    if (!(e instanceof ContentUnavailable)) throw e;
  }
  if (posts.length === 0) return null;

  return (
    <section className="section latest" id="blog" aria-labelledby="latest-title">
      <div className="container">
        <div className="latest__head">
          <header className="section-head section-head--left reveal">
            <p className="eyebrow">Blog &amp; Newsletters</p>
            <h2 className="h2" id="latest-title">From the <em>Blog</em></h2>
            <p className="lead">Stories from the Leela, festival news and updates from the committee.</p>
          </header>
          <Link href="/blog" className="btn btn--outline reveal">
            View all posts <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="blog-grid reveal">
          {posts.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} heading="h3" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
