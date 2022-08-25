import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import TextField from "@mui/material/TextField"
import { useMutation } from "@tanstack/react-query"
import { useSnackbar } from "notistack"
import { useState } from "react"

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
