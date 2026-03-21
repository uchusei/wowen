import { CONTACT_LINKS } from '../constants'

function getRouteAriaLabel(route) {
  switch (route.id) {
    case 'email':
      return 'Email Emma Hager'
    case 'github':
      return 'GitHub profile'
    case 'linkedin':
      return 'LinkedIn profile'
    case 'access':
      return 'Request access to WOWEN'
    default:
      return route.command
  }
}

function ContactOptions({ isVisible, isBusy, onRouteSelect }) {
  return (
    <nav
      className={`contact-options${isVisible ? ' contact-options--visible' : ''}`}
      aria-label="Contact options"
    >
      <p className="contact-options__eyebrow">available routes</p>

      <ul className="contact-options__list">
        {CONTACT_LINKS.map((route, index) => (
          <li key={route.id}>
            {route.kind === 'external' ? (
              <a
                className="contact-link"
                href={route.href}
                onClick={(event) => {
                  event.preventDefault()
                  onRouteSelect(route)
                }}
                aria-disabled={isBusy}
                aria-label={getRouteAriaLabel(route)}
              >
                <span className="contact-link__index">[{String(index + 1).padStart(2, '0')}]</span>
                <span className="contact-link__label">{route.command}</span>
                <span className="contact-link__value">{`> ${route.target}`}</span>
              </a>
            ) : (
              <button
                type="button"
                className="contact-link contact-link--button"
                onClick={() => onRouteSelect(route)}
                disabled={isBusy}
                aria-label={getRouteAriaLabel(route)}
              >
                <span className="contact-link__index">[{String(index + 1).padStart(2, '0')}]</span>
                <span className="contact-link__label">{route.command}</span>
                <span className="contact-link__value">{`> ${route.target}`}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default ContactOptions
