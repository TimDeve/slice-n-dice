import DayjsUtils from "@date-io/dayjs"
import { LocalizationProvider } from "@mui/lab"
import { Button, CssBaseline } from "@mui/material"
import {
  StyledEngineProvider,
  Theme,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles"
import { SnackbarProvider } from "notistack"
import React from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom"

import Login from "./Login"
import MainRoute from "./MainRoute"
import TopBar from "./TopBar"
import { AuthProvider, useAuth } from "./auth"

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#DD2E44",
    },
    secondary: {
      main: "#F44336",
    },
  },
})

const notistackRef = React.createRef<SnackbarProvider>()

const queryClient = new QueryClient()

export default function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={key => (
        <Button onClick={() => notistackRef.current?.closeSnackbar(key)}>
          Dismiss
        </Button>
      )}
    >
      <AuthProvider>
        <LocalizationProvider dateAdapter={DayjsUtils}>
          <QueryClientProvider client={queryClient}>
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <MyRoutes />
              </ThemeProvider>
            </StyledEngineProvider>
          </QueryClientProvider>
        </LocalizationProvider>
      </AuthProvider>
    </SnackbarProvider>
  )
}

function MyRoutes() {
  const { isLoggedIn } = useAuth()

  return (
    <Router>
      <TopBar />
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/" element={<MainRoute />} />
            <Route path="/calendar/:weekStart" element={<MainRoute />} />
            <Route path="/recipes" element={<MainRoute />} />
            <Route path="/fridge" element={<MainRoute />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  )
}
