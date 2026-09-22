import { Link } from 'react-router-dom'

export default function Contact() {
  return (
    <section id="contact" className="page-offset">
      <div className="section-inner">
        {/* Header */}
        <div className="contact-hero">
          <p className="section-label" style={{ justifyContent: 'center' }}>Get in Touch</p>
          <h1 className="section-title">Contact AIFES Lab</h1>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Whether you are an academic researcher, industry collaborator, prospective student,
            or funding partner — we welcome dialogue, research inquiries, and mutual initiatives.
          </p>
        </div>

        {/* 3 Pillars / Info cards */}
        <div className="contact-cards-grid">
          {/* Card 1: Email */}
          <div className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3 className="contact-card-title">General &amp; Research Inquiries</h3>
            <p className="contact-card-desc">
              For academic collaborations, internship applications, seminar invites, and general lab correspondence.
            </p>
            <a href="mailto:aifeslab@gmail.com" className="contact-card-link">
              aifeslab@gmail.com &rarr;
            </a>
          </div>

          {/* Card 2: Location */}
          <div className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="contact-card-title">Lab Location</h3>
            <p className="contact-card-desc">
              Department of Artificial Intelligence<br />
              Indian Institute of Technology Hyderabad<br />
              Kandi, Sangareddy, Telangana 502284, India
            </p>
            <a
              href="https://maps.google.com/?q=IIT+Hyderabad"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card-link"
            >
              View on Map &rarr;
            </a>
          </div>

          {/* Card 3: Community & Education */}
          <div className="contact-card">
            <div className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="contact-card-title">Join the Community</h3>
            <p className="contact-card-desc">
              Participate in weekly Reading Group discussions, monthly AIFES Dialogues, or enroll in our academic courses.
            </p>
            <Link to="/reading-group" className="contact-card-link">
              Reading Group &rarr;
            </Link>
          </div>
        </div>

        {/* Action Banner */}
        <div className="contact-banner">
          <h2 className="contact-banner-title">Ready to Collaborate with AIFES?</h2>
          <p className="contact-banner-sub">
            We partner with financial institutions, regulatory bodies, and academic institutions to develop deployable, trustworthy AI systems.
          </p>
          <div className="contact-ctas">
            <a href="mailto:aifeslab@gmail.com" className="btn-primary">
              Send an Email
            </a>
            <Link to="/research" className="btn-outline">
              Explore Our Research
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
