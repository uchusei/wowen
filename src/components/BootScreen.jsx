import { useEffect, useMemo, useRef, useState } from 'react'
import { BOOT_LINES, buildRouteTranscript } from '../constants'
import ContactOptions from './ContactOptions'
import OutputLine from './OutputLine'
import ProceedPrompt from './ProceedPrompt'

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)

    return () => {
      mediaQuery.removeEventListener('change', updatePreference)
    }
  }, [])

  return prefersReducedMotion
}

function getLineLength(line) {
  return line.segments.reduce((total, segment) => total + segment.text.length, 0)
}

function createSessionId() {
  const bytes = new Uint32Array(1)
  window.crypto.getRandomValues(bytes)
  return bytes[0].toString(16).padStart(8, '0').slice(0, 8)
}

function formatLocalTimestamp() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const timezoneOffsetMinutes = -date.getTimezoneOffset()
  const sign = timezoneOffsetMinutes >= 0 ? '+' : '-'
  const offsetHours = String(
    Math.floor(Math.abs(timezoneOffsetMinutes) / 60),
  ).padStart(2, '0')
  const offsetMinutes = String(
    Math.abs(timezoneOffsetMinutes) % 60,
  ).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`
}

function getDeviceLabel() {
  const userAgent = navigator.userAgent

  if (/iPhone/i.test(userAgent)) return 'iPhone'
  if (/iPad/i.test(userAgent)) return 'iPad'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/Windows/i.test(userAgent)) return 'Windows'
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Mac'
  if (/Linux/i.test(userAgent)) return 'Linux'

  return 'Unknown device'
}

function getRuntimeLabel() {
  const userAgent = navigator.userAgent

  if (/Edg\//i.test(userAgent)) return 'Microsoft Edge'
  if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) {
    return 'Google Chrome'
  }
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    return 'Safari'
  }
  if (/Firefox\//i.test(userAgent)) return 'Firefox'

  return 'Browser runtime'
}

function isSafariBrowser() {
  const userAgent = navigator.userAgent

  return /Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)
}

const FAST_FORWARD_TYPE_SPEED = 4
const FAST_FORWARD_PAUSE = 70

function buildPreludeLines() {
  return [
    {
      id: 'boot-stamp',
      segments: [{ text: `[boot@${formatLocalTimestamp()}]` }],
      tone: 'dim',
      typeSpeed: 24,
      pauseAfter: 650,
    },
    {
      id: 'boot-session',
      segments: [{ text: `session: ${createSessionId()}` }],
      tone: 'dim',
      typeSpeed: 24,
      pauseAfter: 520,
    },
    {
      id: 'boot-build',
      segments: [{ text: 'build: wowen_os@14.3' }],
      tone: 'dim',
      typeSpeed: 24,
      pauseAfter: 520,
    },
    {
      id: 'boot-mode',
      segments: [{ text: 'mode: pre-release' }],
      tone: 'dim',
      typeSpeed: 24,
      pauseAfter: 520,
    },
    {
      id: 'boot-device',
      segments: [{ text: `device: ${getDeviceLabel()}` }],
      tone: 'dim',
      typeSpeed: 24,
      pauseAfter: 520,
    },
    {
      id: 'boot-runtime',
      segments: [{ text: `runtime: ${getRuntimeLabel()}` }],
      tone: 'dim',
      typeSpeed: 24,
      pauseAfter: 520,
    },
    {
      id: 'boot-signal',
      segments: [
        { text: 'signal: ' },
        { text: 'stable', accent: true },
      ],
      tone: 'dim',
      typeSpeed: 24,
      pauseAfter: 1250,
    },
  ]
}

function BootScreen() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const preludeLines = useMemo(() => buildPreludeLines(), [])
  const lastPreludeLineIndex = preludeLines.length - 1
  const lastLineIndex = BOOT_LINES.length - 1
  const [introPhase, setIntroPhase] = useState(() =>
    prefersReducedMotion ? 'hidden' : 'typing',
  )
  const [introLineIndex, setIntroLineIndex] = useState(0)
  const [introTypedCharacters, setIntroTypedCharacters] = useState(0)
  const [currentLineIndex, setCurrentLineIndex] = useState(() =>
    prefersReducedMotion ? lastLineIndex : 0,
  )
  const [typedCharacters, setTypedCharacters] = useState(() =>
    prefersReducedMotion ? getLineLength(BOOT_LINES[lastLineIndex]) : 0,
  )
  const [hasProceeded, setHasProceeded] = useState(false)
  const [actionLines, setActionLines] = useState([])
  const [actionLineIndex, setActionLineIndex] = useState(0)
  const [actionTypedCharacters, setActionTypedCharacters] = useState(0)
  const [isRouteBusy, setIsRouteBusy] = useState(false)
  const [isFastForwarding, setIsFastForwarding] = useState(false)
  const promptRef = useRef(null)
  const routeTimeoutRef = useRef(0)
  const introRunRef = useRef(0)
  const bootRunRef = useRef(0)
  const currentLineIndexRef = useRef(currentLineIndex)
  const typedCharactersRef = useRef(typedCharacters)
  const safariBrowser = useMemo(() => isSafariBrowser(), [])

  useEffect(() => {
    currentLineIndexRef.current = currentLineIndex
    typedCharactersRef.current = typedCharacters
  }, [currentLineIndex, typedCharacters])

  useEffect(() => {
    let timeoutId = 0
    const runId = ++introRunRef.current

    if (prefersReducedMotion) {
      timeoutId = window.setTimeout(() => {
        if (runId !== introRunRef.current) {
          return
        }

        setIntroPhase('hidden')
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    const typeIntroLine = (lineIndex, characterCount) => {
      const line = preludeLines[lineIndex]
      const totalCharacters = getLineLength(line)
      const typeSpeed = line.typeSpeed ?? 18
      const pauseAfter = line.pauseAfter ?? 250

      if (characterCount < totalCharacters) {
        timeoutId = window.setTimeout(() => {
          if (runId !== introRunRef.current) {
            return
          }

          setIntroLineIndex(lineIndex)
          setIntroTypedCharacters(characterCount + 1)
          typeIntroLine(lineIndex, characterCount + 1)
        }, typeSpeed)

        return
      }

      if (lineIndex >= lastPreludeLineIndex) {
        timeoutId = window.setTimeout(() => {
          if (runId !== introRunRef.current) {
            return
          }

          setIntroPhase('fading')
          timeoutId = window.setTimeout(() => {
            if (runId !== introRunRef.current) {
              return
            }

            setIntroPhase('hidden')
          }, 420)
        }, pauseAfter)

        return
      }

      timeoutId = window.setTimeout(() => {
        if (runId !== introRunRef.current) {
          return
        }

        setIntroLineIndex(lineIndex + 1)
        setIntroTypedCharacters(0)
        typeIntroLine(lineIndex + 1, 0)
      }, pauseAfter)
    }

    timeoutId = window.setTimeout(() => {
      if (runId !== introRunRef.current) {
        return
      }

      setIntroPhase('typing')
      setIntroLineIndex(0)
      setIntroTypedCharacters(0)
      typeIntroLine(0, 0)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [lastPreludeLineIndex, prefersReducedMotion, preludeLines])

  useEffect(() => {
    let timeoutId = 0
    const runId = ++bootRunRef.current

    if (!prefersReducedMotion && introPhase !== 'hidden') {
      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    if (prefersReducedMotion) {
      timeoutId = window.setTimeout(() => {
        if (runId !== bootRunRef.current) {
          return
        }

        setHasProceeded(false)
        setCurrentLineIndex(lastLineIndex)
        setTypedCharacters(getLineLength(BOOT_LINES[lastLineIndex]))
        setActionLines([])
        setActionLineIndex(0)
        setActionTypedCharacters(0)
        setIsRouteBusy(false)
        setIsFastForwarding(false)
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    const typeLine = (lineIndex, characterCount) => {
      const line = BOOT_LINES[lineIndex]
      const totalCharacters = getLineLength(line)
      const typeSpeed = isFastForwarding
        ? FAST_FORWARD_TYPE_SPEED
        : (line.typeSpeed ?? 16)
      const pauseAfter = isFastForwarding
        ? FAST_FORWARD_PAUSE
        : (line.pauseAfter ?? 550)

      if (characterCount < totalCharacters) {
        timeoutId = window.setTimeout(() => {
          if (runId !== bootRunRef.current) {
            return
          }

          setCurrentLineIndex(lineIndex)
          setTypedCharacters(characterCount + 1)
          typeLine(lineIndex, characterCount + 1)
        }, typeSpeed)

        return
      }

      if (lineIndex >= lastLineIndex) {
        if (isFastForwarding) {
          setIsFastForwarding(false)
        }

        return
      }

      timeoutId = window.setTimeout(() => {
        if (runId !== bootRunRef.current) {
          return
        }

        setCurrentLineIndex(lineIndex + 1)
        setTypedCharacters(0)
        typeLine(lineIndex + 1, 0)
      }, pauseAfter)
    }

    timeoutId = window.setTimeout(() => {
      if (runId !== bootRunRef.current) {
        return
      }

      const startLineIndex = currentLineIndexRef.current
      const startCharacters = typedCharactersRef.current

      if (
        startLineIndex === lastLineIndex &&
        startCharacters >= getLineLength(BOOT_LINES[lastLineIndex])
      ) {
        return
      }

      typeLine(startLineIndex, startCharacters)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [introPhase, lastLineIndex, prefersReducedMotion, isFastForwarding])

  useEffect(() => {
    return () => {
      window.clearTimeout(routeTimeoutRef.current)
    }
  }, [])

  const sequenceComplete =
    currentLineIndex === lastLineIndex &&
    typedCharacters >= getLineLength(BOOT_LINES[lastLineIndex])
  const renderedLines = useMemo(
    () => BOOT_LINES.slice(0, currentLineIndex + 1),
    [currentLineIndex],
  )

  useEffect(() => {
    if (!sequenceComplete || hasProceeded) {
      return
    }

    const onKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === 'NumpadEnter') {
        event.preventDefault()
        setHasProceeded(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [hasProceeded, sequenceComplete])

  useEffect(() => {
    if (sequenceComplete && !hasProceeded) {
      promptRef.current?.focus()
    }
  }, [hasProceeded, sequenceComplete])

  const actionSequenceComplete =
    actionLines.length > 0 &&
    actionLineIndex === actionLines.length - 1 &&
    actionTypedCharacters >= getLineLength(actionLines[actionLines.length - 1])
  const showSkipControl =
    !hasProceeded &&
    !isFastForwarding &&
    (introPhase !== 'hidden' || !sequenceComplete)

  const handleSkipToProceed = () => {
    introRunRef.current += 1
    bootRunRef.current += 1
    window.clearTimeout(routeTimeoutRef.current)
    if (introPhase !== 'hidden') {
      setIntroPhase('hidden')
      setIntroLineIndex(lastPreludeLineIndex)
      setIntroTypedCharacters(getLineLength(preludeLines[lastPreludeLineIndex]))
      setCurrentLineIndex(0)
      setTypedCharacters(0)
    }

    setHasProceeded(false)
    setActionLines([])
    setActionLineIndex(0)
    setActionTypedCharacters(0)
    setIsRouteBusy(false)
    setIsFastForwarding(true)
  }

  const completeExternalHandoff = (route, openedInNewTab) => {
    if (route.href.startsWith('mailto:')) {
      window.location.assign(route.href)
      return
    }

    if (openedInNewTab) {
      return
    }

    if (route.handoffPath) {
      window.location.assign(route.handoffPath)
    }
  }

  const handleRouteSelect = (route) => {
    if (isRouteBusy) {
      return
    }

    window.clearTimeout(routeTimeoutRef.current)

    const transcript = buildRouteTranscript(route)
    const openedInNewTab =
      route.kind === 'external' &&
      !route.href.startsWith('mailto:') &&
      Boolean(route.handoffPath) &&
      Boolean(window.open(route.handoffPath, '_blank'))

    const shouldSkipLocalTranscript =
      route.kind === 'external' && openedInNewTab && safariBrowser

    if (prefersReducedMotion) {
      if (!shouldSkipLocalTranscript) {
        setActionLines(transcript)
        setActionLineIndex(transcript.length - 1)
        setActionTypedCharacters(getLineLength(transcript[transcript.length - 1]))
      }

      if (route.kind === 'external') {
        routeTimeoutRef.current = window.setTimeout(() => {
          completeExternalHandoff(route, openedInNewTab)
        }, 150)
      }

      return
    }

    if (shouldSkipLocalTranscript) {
      setIsRouteBusy(false)
      setActionLines([])
      setActionLineIndex(0)
      setActionTypedCharacters(0)
      return
    }

    setIsRouteBusy(true)
    setActionLines(transcript)
    setActionLineIndex(0)
    setActionTypedCharacters(0)

    const typeActionLine = (lineIndex, characterCount) => {
      const line = transcript[lineIndex]
      const totalCharacters = getLineLength(line)
      const typeSpeed = line.typeSpeed ?? 20
      const pauseAfter = line.pauseAfter ?? 450

      if (characterCount < totalCharacters) {
        routeTimeoutRef.current = window.setTimeout(() => {
          setActionLineIndex(lineIndex)
          setActionTypedCharacters(characterCount + 1)
          typeActionLine(lineIndex, characterCount + 1)
        }, typeSpeed)

        return
      }

      if (lineIndex >= transcript.length - 1) {
        setIsRouteBusy(false)

        if (route.kind === 'external') {
          const finalPause = line.pauseAfter ?? 0

          routeTimeoutRef.current = window.setTimeout(() => {
            completeExternalHandoff(route, openedInNewTab)
          }, finalPause)
        }

        return
      }

      routeTimeoutRef.current = window.setTimeout(() => {
        setActionLineIndex(lineIndex + 1)
        setActionTypedCharacters(0)
        typeActionLine(lineIndex + 1, 0)
      }, pauseAfter)
    }

    typeActionLine(0, 0)
  }

  return (
    <section
      className={`boot-screen${hasProceeded ? ' boot-screen--proceeded' : ''}`}
      aria-label="WOWEN identity trace"
    >
      <header className="shell-bar">
        <p className="shell-bar__id">wowen_os / tty0</p>
        {showSkipControl ? (
          <button
            type="button"
            className="shell-bar__skip"
            onClick={handleSkipToProceed}
            aria-label="Skip intro sequence"
          >
            [ skip ]
          </button>
        ) : null}
        <p className="shell-bar__status" aria-live="polite">
          <span>status: available</span>
          <span className="status-indicator" aria-hidden="true" />
        </p>
      </header>

      <div className="boot-screen__body">
        <div className="boot-screen__stack">
          <div className="boot-screen__trace" aria-live="polite">
            {introPhase !== 'hidden' ? (
              <div
                className={`boot-screen__intro${
                  introPhase === 'fading' ? ' boot-screen__intro--fading' : ''
                }`}
              >
                {preludeLines.map((line, index) => {
                  const isCurrentIntroLine = index === introLineIndex
                  const visibleCharacters =
                    introPhase === 'fading' || index < introLineIndex
                      ? getLineLength(line)
                      : isCurrentIntroLine
                        ? introTypedCharacters
                        : 0

                  if (visibleCharacters === 0 && index > introLineIndex) {
                    return null
                  }

                  return (
                    <OutputLine
                      key={line.id}
                      line={line}
                      visibleCharacters={visibleCharacters}
                      showCursor={introPhase === 'typing' && isCurrentIntroLine}
                    />
                  )
                })}
              </div>
            ) : (
              <>
                {renderedLines.map((line, index) => {
                  const isCurrentLine = index === renderedLines.length - 1
                  const visibleCharacters =
                    isCurrentLine && !sequenceComplete
                      ? typedCharacters
                      : getLineLength(line)

                  return (
                    <OutputLine
                      key={line.id}
                      line={line}
                      visibleCharacters={visibleCharacters}
                      showCursor={isCurrentLine && !sequenceComplete}
                    />
                  )
                })}

                {actionLines.map((line, index) => {
                  const isCurrentActionLine = index === actionLineIndex
                  const visibleCharacters =
                    isCurrentActionLine && !actionSequenceComplete
                      ? actionTypedCharacters
                      : index < actionLineIndex || actionSequenceComplete
                        ? getLineLength(line)
                        : 0

                  if (visibleCharacters === 0 && index > actionLineIndex) {
                    return null
                  }

                  return (
                    <OutputLine
                      key={line.id}
                      line={line}
                      visibleCharacters={visibleCharacters}
                      showCursor={isCurrentActionLine && isRouteBusy}
                    />
                  )
                })}
              </>
            )}
          </div>

          {introPhase === 'hidden' && sequenceComplete && !hasProceeded ? (
            <ProceedPrompt
              onProceed={() => setHasProceeded(true)}
              promptRef={promptRef}
            />
          ) : null}
        </div>

        <ContactOptions
          isVisible={hasProceeded}
          isBusy={isRouteBusy}
          onRouteSelect={handleRouteSelect}
        />
      </div>
    </section>
  )
}

export default BootScreen
