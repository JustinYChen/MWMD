import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 不使用 StrictMode:它在开发模式下双挂载组件,
// 导致 GSAP/Framer Motion 入场动画执行两次,观感不佳。
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
