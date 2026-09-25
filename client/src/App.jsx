import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Research from './pages/Research'
import Education from './pages/Education'
import ReadingGroup from './pages/ReadingGroup'
import Events from './pages/Events'
import NewsUpdates from './pages/NewsUpdates'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/education" element={<Education />} />
          <Route path="/reading-group" element={<ReadingGroup />} />
          <Route path="/events" element={<Events />} />
          <Route path="/news" element={<NewsUpdates />} />
          <Route path="/news-updates" element={<Navigate to="/news" replace />} />
          <Route path="/outreach" element={<Navigate to="/events" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/people" element={<Navigate to="/about" replace />} />
          <Route path="/community" element={<Navigate to="/about" replace />} />
          <Route path="/outputs" element={<Navigate to="/about" replace />} />
          <Route path="/partners" element={<Navigate to="/about" replace />} />
          <Route path="/roadmap" element={<Navigate to="/about" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
