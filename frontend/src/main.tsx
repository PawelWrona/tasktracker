import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './app/router.ts'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './shared/theme/ThemeProvider.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <RouterProvider router={ router } />
    </ThemeProvider>
  </QueryClientProvider>
)
