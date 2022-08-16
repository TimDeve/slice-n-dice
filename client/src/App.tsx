import DayjsUtils from "@date-io/dayjs"
import { LocalizationProvider } from "@mui/lab"
import {
  AppBar,
  Button,
  CssBaseline,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material"
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles"
import { SnackbarProvider } from "notistack"
import React from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import {
  Link,
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useMatch,
} from "react-router-dom"

import { AuthProvider, useAuth } from "./auth"
import * as gateway from "./gateway"
import * as pages from "./pages"
import theme from "./theme"

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

function TopBar() {
  const { isLoggedIn } = useAuth()

  const isRootPage = useMatch({ path: "/" })!!
  const isCalendarPage =
    useMatch({ path: "/calendar/:weekStart" })!! || isRootPage
  const isRecipesPage = useMatch({ path: "/recipes" })!!
  const isFridgePage = useMatch({ path: "/fridge" })!!

  let currentPage = ""
  if (isCalendarPage) {
    currentPage = "calendar"
  } else if (isRecipesPage) {
    currentPage = "recipes"
  } else if (isFridgePage) {
    currentPage = "fridge"
  }

  return (
    <AppBar position="sticky">
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography component="p" variant="h6">
          Slice n' Dice
        </Typography>

        {isLoggedIn && (
          <Button style={{ color: "white" }} onClick={() => gateway.logOut()}>
            Logout
          </Button>
        )}
      </Toolbar>
      {["calendar", "recipes", "fridge"].indexOf(currentPage) >= 0 && (
        <Tabs
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: "#FFFFFF" } }}
          value={currentPage}
          aria-label="simple tabs example"
        >
          <Tab label="Calendar" value="calendar" component={Link} to={"/"} />
          <Tab
            label="Recipes"
            value="recipes"
            component={Link}
            to={"/recipes"}
          />
          <Tab label="Fridge" value="fridge" component={Link} to={"/fridge"} />
        </Tabs>
      )}
    </AppBar>
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
            <Route path="/" element={<pages.Calendar />} />
            <Route path="/calendar/:weekStart" element={<pages.Calendar />} />
            <Route path="/recipes" element={<pages.Recipes />} />
            <Route path="/fridge" element={<pages.Fridge />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<pages.Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  )
}
