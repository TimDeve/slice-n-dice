import React from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { MuiPickersUtilsProvider } from "@material-ui/pickers/MuiPickersUtilsProvider"
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles"
import {
  CssBaseline,
  Button,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
} from "@material-ui/core"
import { SnackbarProvider } from "notistack"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  Redirect,
} from "react-router-dom"
import DayjsUtils from "@date-io/dayjs"

import Fridge from "./Fridge"
import Recipes from "./Recipes"
import Calendar from "./Calendar"
import Login from "./Login"
import { AuthProvider, useAuth } from "./auth"
import * as gateway from "./gateway"

const theme = createMuiTheme({
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
        <MuiPickersUtilsProvider utils={DayjsUtils}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Routes />
            </ThemeProvider>
          </QueryClientProvider>
        </MuiPickersUtilsProvider>
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
