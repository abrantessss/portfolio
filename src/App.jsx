import Navbar from './components/Navbar'
import Intro from './components/Intro'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  // overflow-x-clip rather than overflow-hidden: it contains the hero's
  // oversized decorative layers without making this element a scroll container.
  return (
    <div className="min-h-screen bg-stone-100 text-stone-950 overflow-x-clip">
      <Navbar />
      <Intro />
      <About />
      <Projects />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
