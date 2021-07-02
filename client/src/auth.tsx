import axios from "axios"
import React, { ReactNode, useContext, useEffect, useState } from "react"

const InternalAuthContext = React.createContext({ isLoggedIn: true })

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
        if (axios.isAxiosError(error) && error.code === "401") {
          setIsLoggedIn(false)
        }
        return Promise.reject(error)
      }
    )

    return () => axios.interceptors.request.eject(authInterceptor)
  }, [isLoggedIn])

  return <Provider value={{ isLoggedIn }}>{children}</Provider>
}

export function useAuth() {
  const authContext = useContext(InternalAuthContext)
  return authContext
}
