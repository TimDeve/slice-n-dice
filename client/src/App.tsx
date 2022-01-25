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
  Link,
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
  useRouteMatch,
} from "react-router-dom"

import Calendar from "./Calendar"
import Fridge from "./Fridge"
import Login from "./Login"
import Recipes from "./Recipes"
import { AuthProvider, useAuth } from "./auth"
import * as gateway from "./gateway"

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
                <Routes />
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

  const isRootPage = useRouteMatch({ path: "/", exact: true })!!
  const isCalendarPage = useRouteMatch({ path: "/calendar" })!! || isRootPage
  const isRecipesPage = useRouteMatch({ path: "/recipes", exact: true })!!
  const isFridgePage = useRouteMatch({ path: "/fridge", exact: true })!!

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

function Routes() {
  const { isLoggedIn } = useAuth()

  return (
    <Router>
      <TopBar />
      <Switch>
        {isLoggedIn ? (
          <>
            <Route exact path="/">
              <Calendar />
            </Route>
            <Route path="/calendar/:weekStart">
              <Calendar />
            </Route>
            <Route path="/recipes">
              <Recipes />
            </Route>
            <Route path="/fridge">
              <Fridge />
            </Route>
            <Redirect to="/" />
          </>
        ) : (
          <>
            <Route exact path="/login">
              <Login />
            </Route>
            <Redirect to="/login" />
          </>
        )}
      </Switch>
    </Router>
  )
}
