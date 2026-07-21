import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/** 简易错误边界,防止 3D 场景异常导致整页白屏 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full w-full items-center justify-center p-8 text-center">
            <div>
              <p className="font-serif text-lg text-fg">3D 场景加载失败</p>
              <p className="mt-2 text-sm text-fg-soft">
                请刷新页面重试，或检查浏览器 WebGL 支持。
              </p>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
