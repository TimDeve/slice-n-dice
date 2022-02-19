import { AppBar, Button, Tab, Tabs, Toolbar, Typography } from "@mui/material"
import { Link } from "react-router-dom"

import { useAuth } from "./auth"
import * as gateway from "./gateway"
import useCurrentPage from "./shared/useCurrentPage"

export default function TopBar() {
  const { isLoggedIn } = useAuth()

  const currentPage = useCurrentPage()

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
      {currentPage && (
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
