import { createHashRouter, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { PageTransition } from '@/components/layout/PageTransition'
import { TransitionVeil } from '@/components/layout/TransitionVeil'
import HomePage from '@/pages/HomePage'
import DrawPage from '@/pages/DrawPage'
import FavoritesPage from '@/pages/FavoritesPage'
import HistoryPage from '@/pages/HistoryPage'
import SettingsPage from '@/pages/SettingsPage'
import QuestionBankPage from '@/pages/QuestionBankPage'

function RootLayout() {
  const loc = useLocation()
  const isDraw = loc.pathname === '/draw'
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
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'banks', element: <QuestionBankPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
