import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import BlogList from "@/components/BlogList";
import { ContentUnavailable, listAllPosts, type PostSummary } from "@/lib/contentApi";
import "../post-card.css";
import "./blog.css";

export const metadata: Metadata = {
  title: `Blog & Newsletters - ${BRAND.name}`,
  description: `Stories, news and newsletters from the ${BRAND.name}: Leela, festivals, seva and community updates.`,
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  let posts: PostSummary[] | null = null;
  try {
    posts = await listAllPosts();
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
            {posts ? (
              <BlogList posts={posts} />
            ) : (
              <p className="blog-empty">Posts can’t be loaded right now. Please try again in a little while.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
