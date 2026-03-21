function OutputLine({ line, visibleCharacters, showCursor = false }) {
  return (
    <p
      className={[
        'output-line',
        line.tone ? `output-line--${line.tone}` : '',
        line.offset ? `output-line--${line.offset}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {line.prefix ? <span className="output-line__prefix">{line.prefix}</span> : null}

      <span className="output-line__content">
        {line.segments.reduce((elements, segment, index) => {
          const previousLength = line.segments
            .slice(0, index)
            .reduce((total, item) => total + item.text.length, 0)
          const visibleLength = Math.max(
            0,
            Math.min(segment.text.length, visibleCharacters - previousLength),
          )
          const text = segment.text.slice(0, visibleLength)

          if (!text) {
            return elements
          }

          const indicatorVisible =
            segment.indicator && text.length === segment.text.length
          const dotsVisible =
            segment.dots && text.length === segment.text.length

          return elements.concat(
            <span
              key={`${line.id}-${index}`}
              className={[
                'output-line__segment',
                segment.accent ? 'output-line__segment--accent' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {text}
              {indicatorVisible ? (
                <span className="status-indicator" aria-hidden="true" />
              ) : null}
              {dotsVisible ? (
                <span className="output-line__dots" aria-hidden="true">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              ) : null}
            </span>,
          )
        }, [])}

        {showCursor ? <span className="terminal-cursor" aria-hidden="true" /> : null}
      </span>
    </p>
  )
}

export default OutputLine
