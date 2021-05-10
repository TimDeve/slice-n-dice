import React from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles"
import { CssBaseline, Button } from "@material-ui/core"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import localizedFormat from "dayjs/plugin/localizedFormat"
import { SnackbarProvider } from "notistack"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Recipes from "./Recipes"

dayjs.extend(localizedFormat)
dayjs.extend(duration)

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#DD2E44",
    },
    secondary: {
      main: "#f50057",
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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes />
        </ThemeProvider>
      </QueryClientProvider>
    </SnackbarProvider>
  )
}

function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Recipes />
        </Route>
      </Switch>
    </Router>
  )
}
