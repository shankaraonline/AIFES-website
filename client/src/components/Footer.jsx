import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">AI Innovation Lab - IIT Hyderabad</div>
        <ul className="footer-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/research">Research</Link></li>
          <li><Link to="/education">Education</Link></li>
          <li><Link to="/reading-group">Reading Group</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/news">News &amp; Updates</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <div className="footer-copy">© {new Date().getFullYear()} AI Innovation Lab - AI for Finance, Economies &amp; Society</div>
      </div>
    </footer>
  )
}
