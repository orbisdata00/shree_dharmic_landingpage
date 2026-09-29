export default function Community() {
  return (
    <section className="community" id="volunteer">
      <div className="community__media" data-parallax="0.18">
        <img src="/assets/img/community.jpg" alt="A crowd of devotees singing kirtan together during Rath Yatra" loading="lazy" />
      </div>
      <div className="community__overlay"></div>
      <div className="container community__inner">
        <div className="community__card glass reveal">
          <p className="eyebrow eyebrow--light">Seva · Volunteer</p>
          <h2 className="h2">Be Part of the <em>Parampara</em></h2>
          <p>Every Leela is made possible by seva. Lend your hands on stage, backstage or among the audience - or become a member and help carry this tradition to the next generation.</p>
          <div className="community__actions">
            <a href="#contact" className="btn btn--primary">Volunteer With Us</a>
            <a href="/membership" className="btn btn--glass">Become a Member</a>
          </div>
        </div>
      </div>
    </section>
  );
}
