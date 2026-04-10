import { useAuth0 } from '@auth0/auth0-react'

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect, error } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-600 text-sm mb-4">{error.message}</p>
          
          <div className="bg-gray-50 rounded p-3 mb-4 text-left">
            <p className="text-xs font-mono text-gray-700 mb-2"><strong>Debug Info:</strong></p>
            <p className="text-xs font-mono text-gray-600">Domain: {import.meta.env.VITE_AUTH0_DOMAIN}</p>
            <p className="text-xs font-mono text-gray-600">Client ID: {import.meta.env.VITE_AUTH0_CLIENT_ID}</p>
            <p className="text-xs font-mono text-gray-600 mt-2">Error: {error.error || 'unknown'}</p>
            <p className="text-xs font-mono text-gray-600">Description: {error.error_description || 'N/A'}</p>
          </div>

          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🪿</div>
          <h1 className="text-2xl font-bold text-white mb-2">Goose Chasers</h1>
          <p className="text-gray-400 text-sm mb-8">Admin Dashboard</p>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return children
}
