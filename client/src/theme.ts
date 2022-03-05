import { Theme, createTheme } from "@mui/material"
import * as colors from "@mui/material/colors"
import * as styles from "@mui/material/styles"

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
      main: "#C65045",
    },
    secondary: {
      main: "#FFCC80",
    },
    neutral: {
      main: "rgba(0, 0, 0, 0.87)",
      contrastText: colors.common.white,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFEFE",
        },
      },
    },
  },
})

export default theme
