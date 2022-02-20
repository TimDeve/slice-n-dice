import { Theme, createTheme } from "@mui/material"
import { green } from "@mui/material/colors"

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"]
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions["primary"]
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    neutral: true
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#DD2E44",
    },
    secondary: {
      main: "#BF360C",
    },
    neutral: {
      main: "#222222",
      contrastText: "#fff",
    },
  },
})

export default theme
