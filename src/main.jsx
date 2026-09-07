import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const links = [
  { label: 'Email', value: 'emma@wowen.se', href: 'mailto:emma@wowen.se' },
  { label: 'LinkedIn', value: 'Emma Hager', href: 'https://linkedin.com/in/emmahager' },
  { label: 'GitHub', value: '@uchusei', href: 'https://github.com/uchusei' },
]

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12">
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  )
}

function App() {
  return (
    <div className="page-shell">
      <header className="site-header" aria-label="Site header">
        <a className="wordmark" href="/" aria-label="WOWEN home">
          <img src="/wowen-logo.svg" alt="" />
        </a>
      </header>

      <main id="main-content">
        <h1>
          I build things that make sense in a world that doesn’t. Digital Product Lead &amp; Developer, based in Stockholm.
        </h1>

        <div className="details">
          <p>
            Selected collaborations include Bonnier, Adidas, Axiell, Publit and Notion—across dozens of products, platforms and ideas.
          </p>
          <p>
            Currently busy, always curious. If you have an idea worth exploring—or simply want to talk—get in touch.
          </p>
        </div>
      </main>

      <footer>
        <nav aria-label="Contact links">
          {links.map((link) => (
            <a key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noreferrer' : undefined}>
              <span>{link.label}</span>
              <span className="link-value">{link.value}<Arrow /></span>
            </a>
          ))}
        </nav>
        <p className="copyright">© {new Date().getFullYear()} WOWEN</p>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
