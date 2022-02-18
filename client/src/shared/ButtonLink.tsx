import Button, { ButtonProps } from "@mui/material/Button"
import { Link } from "react-router-dom"

export default function ButtonLink(
  props: ButtonProps<typeof Link>
): JSX.Element {
  return <Button component={Link} {...props} />
}
