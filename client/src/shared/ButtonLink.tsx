import Button, { ButtonProps } from "@mui/material/Button"
import { Link } from "react-router-dom"

export default function ButtonLink(props: ButtonProps<Link>): JSX.Element {
  return <Button component={Link} {...props} />
}
