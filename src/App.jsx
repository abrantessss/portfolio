import Navbar from './components/Navbar'
import Intro from './components/Intro'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'


function App() {
    return (
      <div className="min-h-screen stone-100 text-stone-950 overflow-hidden">
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
