import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { setTokenGetter } from '../api'

export default function TokenProvider({ children }) {
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    setTokenGetter(() =>
      getAccessTokenSilently({
        authorizationParams: {
        },
      })
    )
  }, [getAccessTokenSilently])

  return children
}
