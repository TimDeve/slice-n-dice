import React from "react"
import { QueryClient, QueryClientProvider } from "react-query"
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
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import localizedFormat from "dayjs/plugin/localizedFormat"
import { SnackbarProvider } from "notistack"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  Redirect,
} from "react-router-dom"

import Recipes from "./Recipes"
import Calendar from "./Calendar"

dayjs.extend(localizedFormat)
dayjs.extend(duration)

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#DD2E44",
    },
    secondary: {
      main: "#FFFFFF",
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
      action={(key) => (
        <Button onClick={() => notistackRef.current?.closeSnackbar(key)}>
          Dismiss
        </Button>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes />
        </ThemeProvider>
      </QueryClientProvider>
    </SnackbarProvider>
  )
}

function TopBar() {
  const isCalendarPage = useRouteMatch({ path: "/", exact: true })!!
  const isRecipesPage = useRouteMatch({ path: "/recipes", exact: true })!!

  let currentPage = null
  if (isCalendarPage) {
    currentPage = "calendar"
  } else if (isRecipesPage) {
    currentPage = "recipes"
  }

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography component="p" variant="h6">
          Slice n' Dice
        </Typography>
      </Toolbar>
      <Tabs
        value={currentPage}
        onChange={console.log}
        aria-label="simple tabs example"
      >
        <Tab label="Calendar" value="calendar" component={Link} to={"/"} />
        <Tab label="Recipes" value="recipes" component={Link} to={"/recipes"} />
      </Tabs>
    </AppBar>
  )
}

function Routes() {
  return (
    <Router>
      <TopBar />
      <Switch>
        <Route exact path="/">
          <Calendar />
        </Route>
        <Route path="/recipes">
          <Recipes />
        </Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  )
}
