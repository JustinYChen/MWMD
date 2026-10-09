import { createHashRouter, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { PageTransition } from '@/components/layout/PageTransition'
import { TransitionVeil } from '@/components/layout/TransitionVeil'
import { useCloudSync } from '@/hooks/useCloudSync'
import HomePage from '@/pages/HomePage'
import DrawPage from '@/pages/DrawPage'
import FavoritesPage from '@/pages/FavoritesPage'
import HistoryPage from '@/pages/HistoryPage'
import SettingsPage from '@/pages/SettingsPage'
import QuestionBankPage from '@/pages/QuestionBankPage'
import PlansPage from '@/pages/PlansPage'

function RootLayout() {
  const loc = useLocation()
  const isDraw = loc.pathname === '/draw'
  // 云同步挂在 Router 内常驻布局(需要 useLocation 监听路由切换触发拉取)
  useCloudSync()
  return (
    <>
      <TransitionVeil />
      {!isDraw && <Navbar />}
      <AnimatePresence mode="wait">
        <PageTransition key={loc.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </>
  )
}

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'draw', element: <DrawPage /> },
      { path: 'plans', element: <PlansPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'banks', element: <QuestionBankPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
