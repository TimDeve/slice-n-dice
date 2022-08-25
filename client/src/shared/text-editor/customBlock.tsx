import TitleIcon from "@mui/icons-material/Title"

export const headerThree = {
  name: "H3",
  renderer: (block: { getText: () => string }) => `<h3>${block.getText()}</h3>`, // TODO: See if there is a way to render other blocks inside this block
  type: "block" as const,
  icon: <TitleIcon />,
  blockWrapper: <h3 />,
}
