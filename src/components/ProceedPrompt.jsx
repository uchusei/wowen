function ProceedPrompt({ onProceed, promptRef }) {
  return (
    <button
      ref={promptRef}
      type="button"
      className="proceed-prompt"
      onClick={onProceed}
      aria-label="Proceed to contact options"
    >
      <span className="proceed-prompt__label">[ PRESS ENTER ]</span>
      <span className="proceed-prompt__cursor" aria-hidden="true" />
    </button>
  )
}

export default ProceedPrompt
