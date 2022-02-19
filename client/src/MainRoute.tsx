import { useMediaQuery, useTheme } from "@mui/material"
import { useNavigate } from "react-router-dom"
import SwipeableViews from "react-swipeable-views"

import Calendar from "./Calendar"
import Fridge from "./Fridge"
import Recipes from "./Recipes"
import useCurrentPage, { Pages } from "./shared/useCurrentPage"

type PageIndex = 0 | 1 | 2

function getCurrentPageIndex(currentPage: Pages): PageIndex {
  switch (currentPage) {
    case "calendar":
      return 0
    case "recipes":
      return 1
    case "fridge":
      return 2
    default:
      return 0
  }
}

function getPageByIndex(currentPage: number): Pages {
  switch (currentPage) {
    case 0:
      return "calendar"
    case 1:
      return "recipes"
    case 2:
      return "fridge"
    default:
      return "calendar"
  }
}

export default function MainRoute() {
  const theme = useTheme()
  const isSmallScreen = !useMediaQuery(theme.breakpoints.up("sm"))
  const currentPage = useCurrentPage()
  const index = getCurrentPageIndex(currentPage)

  const navigate = useNavigate()

  function onChangeIndex(index: number) {
    const newPage = getPageByIndex(index)
    if (newPage === "calendar") {
      navigate(`/`)
    } else {
      navigate(`/${newPage}`)
    }
  }

  return (
    <>
      <SwipeableViews
        animateTransitions={isSmallScreen}
        disabled={!isSmallScreen}
        index={index}
        // animateHeight
        onChangeIndex={onChangeIndex}
      >
        <Calendar />
        <Recipes focused={index === 1} />
        <Fridge focused={index === 2} />
      </SwipeableViews>
    </>
  )
}
