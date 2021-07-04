import { useState } from "react"
import { useSnackbar } from "notistack"
import { useMutation } from "react-query"

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
      <input
        type="text"
        autoComplete="username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <br />
      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />
      <button>Login</button>
    </form>
  )
}
