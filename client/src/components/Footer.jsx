import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">AIFES Lab · IIT Hyderabad</div>
        <ul className="footer-links">
          <li><Link to="/research">Research</Link></li>
          <li><Link to="/education">Education</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <div className="footer-copy">© {new Date().getFullYear()} AIFES · AI for Finance, Economies &amp; Society</div>
      </div>
    </footer>
  )
}
