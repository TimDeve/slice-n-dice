import { Card } from "@mui/material"
import { RawDraftContentState, convertToRaw } from "draft-js"
import MUIRichTextEditor from "mui-rte"

interface NewRecipeBodyFieldProps {
  onChange: (state: RawDraftContentState) => void
  key: number
}

export default function NewRecipeBodyField(p: NewRecipeBodyFieldProps) {
  return (
    <Card sx={{ minHeight: "160px" }} variant="outlined">
      <MUIRichTextEditor
        label="Recipe instructions..."
        key={p.key}
        controls={[
          "title",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "link",
          "numberList",
          "bulletList",
        ]}
        onChange={s => p.onChange(convertToRaw(s.getCurrentContent()))}
        inlineToolbar={true}
      />
    </Card>
  )
}
