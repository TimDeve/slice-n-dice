import React from "react"
import ReactDOM from "react-dom"

import App from "./App"
import { setupDayjs } from "./dayjs"
import "./index.css"

setupDayjs()

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
)
