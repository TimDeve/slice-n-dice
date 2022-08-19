import { Card } from "@mui/material"
import { EditorState, RawDraftContentState, convertToRaw } from "draft-js"
import draftToHtml from "draftjs-to-html"
import MUIRichTextEditor from "mui-rte"

interface NewRecipeBodyFieldProps {
  onChange: (state: string) => void
  fieldKey: number
}

export default function NewRecipeBodyField(p: NewRecipeBodyFieldProps) {
  function onChange(s: EditorState) {
    const raw = convertToRaw(s.getCurrentContent())
    const html = draftToHtml(raw)
    p.onChange(html)
  }

  return (
    <Card sx={{ minHeight: "160px" }} variant="outlined">
      <MUIRichTextEditor
        label="Recipe instructions..."
        key={p.fieldKey}
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
        inlineToolbar={true}
        toolbarButtonSize="small"
        onChange={onChange}
      />
    </Card>
  )
}
