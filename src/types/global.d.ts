declare global {
  interface Window {
    musicPlayer?: {
      startRandomPlay: () => void
      playNextRandom: () => void
    }
  }
}

export {}
