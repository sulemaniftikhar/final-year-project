import { AuthProvider } from "@/context/AuthContext"
import { DataProvider } from "@/context/DataContext"
import AppRouter from "@/components/AppRouter"
import ErrorBoundary from "@/components/ErrorBoundary"

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </DataProvider>
    </AuthProvider>
  )
}
