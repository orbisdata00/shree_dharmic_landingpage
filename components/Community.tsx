export default function Community() {
  return (
    <section className="community" id="community">
      <div className="community__media" data-parallax="0.18">
        <img src="/assets/img/community.jpg" alt="A crowd of devotees singing kirtan together during Rath Yatra" loading="lazy" />
      </div>
      <div className="community__overlay"></div>
      <div className="container community__inner">
        <div className="community__card glass reveal">
          <p className="eyebrow eyebrow--light">Sangha · Community</p>
          <h2 className="h2">Be Part of the <em>Journey</em></h2>
          <p>Join a community that celebrates Dharma, devotion, culture, and the timeless stories that connect generations.</p>
          <div className="community__actions">
            <a href="/membership" className="btn btn--primary">Join Our Community</a>
            <a href="#contact" className="btn btn--glass">Contact Us</a>
          </div>
        </div>
      </div>
    </section>
  );
}
