import { Component } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ZahradaPro error:', error, info)
  }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={28} className="text-destructive"/>
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Něco se pokazilo</h1>
          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
            Aplikace narazila na neočekávanou chybu. Data jsou uložena — nic jste neztratili.
          </p>
          {this.state.error && (
            <p className="text-xs text-muted-foreground/60 font-mono bg-muted rounded-lg px-3 py-2 mb-5 text-left break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors active:scale-95 touch-manipulation"
            >
              <RotateCcw size={14}/>Zkusit znovu
            </button>
            <button
              onClick={() => { localStorage.clear(); window.location.reload() }}
              className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground text-sm font-semibold rounded-xl hover:bg-accent transition-colors active:scale-95 touch-manipulation"
            >
              Resetovat aplikaci
            </button>
          </div>
        </div>
      </div>
    )
  }
}
