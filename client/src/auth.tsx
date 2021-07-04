import axios from "axios"
import React, { ReactNode, useContext, useEffect, useState } from "react"

interface AuthContext {
  isLoggedIn: boolean
}

const InternalAuthContext = React.createContext<AuthContext>({
  isLoggedIn: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true)
  const { Provider } = InternalAuthContext
  useEffect(() => {
    const authInterceptor = axios.interceptors.response.use(
      res => {
        if (!isLoggedIn) {
          setIsLoggedIn(true)
        }
        return res
      },
      error => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setIsLoggedIn(false)
        }

        return Promise.reject(error)
      }
    )

    return () => axios.interceptors.request.eject(authInterceptor)
  }, [isLoggedIn])

  return <Provider value={{ isLoggedIn }}>{children}</Provider>
}

export function useAuth(): AuthContext {
  const authContext = useContext(InternalAuthContext)
  return authContext
}
