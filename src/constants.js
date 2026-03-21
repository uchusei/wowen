export const BOOT_LINES = [
  {
    id: 'init',
    prefix: '>',
    segments: [
      { text: 'initializing system... WOWEN OS v0.1 — pre-release build' },
    ],
    tone: 'dim',
    typeSpeed: 30,
    pauseAfter: 1450,
  },
  {
    id: 'entity',
    prefix: '>',
    segments: [{ text: 'loading entity: EMMA_HAGER' }],
    tone: 'strong',
    typeSpeed: 30,
    pauseAfter: 1300,
  },
  {
    id: 'statement',
    prefix: '>',
    segments: [
      { text: "Emma builds things that make sense in a world that doesn't." },
    ],
    typeSpeed: 31,
    pauseAfter: 1600,
  },
  {
    id: 'role',
    prefix: '>',
    segments: [{ text: 'role: Senior Product Lead / Systems Architect' }],
    typeSpeed: 30,
    pauseAfter: 1350,
  },
  {
    id: 'status',
    prefix: '>',
    segments: [
      { text: 'status: ' },
      { text: 'active', accent: true },
    ],
    typeSpeed: 28,
    pauseAfter: 1300,
  },
  {
    id: 'scan',
    prefix: '>',
    segments: [{ text: 'scanning capabilities...' }],
    tone: 'dim',
    typeSpeed: 28,
    pauseAfter: 1450,
  },
  {
    id: 'scope',
    prefix: '>',
    segments: [
      {
        text: 'Emma operates across tech, code, product strategy, positioning, systems security, design & communications',
      },
    ],
    tone: 'strong',
    typeSpeed: 29,
    pauseAfter: 1650,
  },
  {
    id: 'cap-product',
    prefix: '✔',
    segments: [{ text: 'product strategy', accent: true }],
    tone: 'accent',
    typeSpeed: 26,
    pauseAfter: 950,
  },
  {
    id: 'cap-ux',
    prefix: '✔',
    segments: [{ text: 'ux systems', accent: true }],
    tone: 'accent',
    typeSpeed: 26,
    pauseAfter: 950,
  },
  {
    id: 'cap-stack',
    prefix: '✔',
    segments: [{ text: 'full-stack execution', accent: true }],
    tone: 'accent',
    typeSpeed: 26,
    pauseAfter: 950,
  },
  {
    id: 'cap-narrative',
    prefix: '✔',
    segments: [{ text: 'narrative engineering', accent: true }],
    tone: 'accent',
    typeSpeed: 26,
    pauseAfter: 1150,
  },
  {
    id: 'process',
    prefix: '>',
    segments: [{ text: 'resolving anomaly signature', dots: true }],
    tone: 'dim',
    typeSpeed: 28,
    pauseAfter: 2200,
  },
  {
    id: 'anomaly',
    prefix: '>',
    segments: [{ text: 'anomaly detected:' }],
    typeSpeed: 28,
    pauseAfter: 1250,
  },
  {
    id: 'thinking',
    segments: [{ text: 'non-linear thinker' }],
    offset: 'detail',
    typeSpeed: 28,
    pauseAfter: 950,
  },
  {
    id: 'pattern',
    segments: [
      { text: 'pattern recognition: ' },
      { text: 'HIGH', accent: true },
    ],
    offset: 'detail',
    typeSpeed: 28,
    pauseAfter: 1450,
  },
  {
    id: 'proceed',
    prefix: '>',
    segments: [{ text: 'proceed?' }],
    typeSpeed: 28,
    pauseAfter: 0,
  },
]

export const CONTACT_LINKS = [
  {
    id: 'email',
    command: 'transmit signal',
    target: 'email',
    href: 'mailto:emma@wowen.se',
    destination: 'mailto:emma@wowen.se',
    kind: 'external',
  },
  {
    id: 'github',
    command: 'inspect codebase',
    target: 'github',
    href: 'https://github.com/uchusei',
    destination: 'github.com/uchusei',
    handoffPath: '/handoff/github.html',
    kind: 'external',
  },
  {
    id: 'linkedin',
    command: 'verify identity',
    target: 'linkedin',
    href: 'https://linkedin.com/in/emmahager',
    destination: 'linkedin.com/in/emmahager',
    handoffPath: '/handoff/linkedin.html',
    kind: 'external',
  },
  {
    id: 'access',
    command: 'request access',
    target: 'enter wowen',
    kind: 'internal',
  },
]

export function buildRouteTranscript(route) {
  if (route.kind === 'internal') {
    return [
      {
        id: `${route.id}-denied`,
        segments: [{ text: 'access denied' }],
        tone: 'warning',
        typeSpeed: 24,
        pauseAfter: 850,
      },
      {
        id: `${route.id}-reason`,
        segments: [{ text: 'reason: not publicly deployed' }],
        tone: 'dim',
        typeSpeed: 24,
        pauseAfter: 850,
      },
      {
        id: `${route.id}-override`,
        segments: [{ text: 'override: contact required' }],
        tone: 'dim',
        typeSpeed: 24,
        pauseAfter: 0,
      },
    ]
  }

  return [
    {
      id: `${route.id}-opening`,
      prefix: '>',
      segments: [{ text: 'opening external route...' }],
      tone: 'dim',
      typeSpeed: 24,
      pauseAfter: 700,
    },
    {
      id: `${route.id}-destination`,
      prefix: '>',
      segments: [{ text: `destination: ${route.destination}` }],
      tone: 'strong',
      typeSpeed: 24,
      pauseAfter: 700,
    },
    {
      id: `${route.id}-handoff`,
      prefix: '>',
      segments: [{ text: 'handoff confirmed' }],
      tone: 'dim',
      typeSpeed: 24,
      pauseAfter: 350,
    },
  ]
}
