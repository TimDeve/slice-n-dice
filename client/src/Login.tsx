import { useState } from "react"
import { useSnackbar } from "notistack"
import { useMutation } from "react-query"
import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Container from "@material-ui/core/Container"
import TextField from "@material-ui/core/TextField"

import * as gateway from "./gateway"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const { enqueueSnackbar } = useSnackbar()
  const { mutate: logIn } = useMutation(gateway.logIn, {
    onSuccess: () => {},
    onError: () => {
      enqueueSnackbar("Failed to login", { variant: "error" })
    },
  })

  return (
    <Container maxWidth="xs">
      <Card style={{ marginTop: "36px", paddingBottom: "4px" }}>
        <form
          onSubmit={e => {
            e.preventDefault()
            if (username && password) {
              logIn({
                username,
                password,
              })
            }
          }}
        >
          <CardContent>
            <TextField
              type="text"
              autoComplete="username"
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              autoComplete="current-password"
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
          </CardContent>
          <CardActions>
            <Button variant="contained" color="primary" fullWidth type="submit">
              Login
            </Button>
          </CardActions>
        </form>
      </Card>
    </Container>
  )
}
