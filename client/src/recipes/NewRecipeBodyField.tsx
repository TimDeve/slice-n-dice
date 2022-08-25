import { Card } from "@mui/material"
import type { EditorState } from "draft-js"

import RichTextEditor from "../shared/text-editor/RichTextEditor"
import stateToHtml from "../shared/text-editor/stateToHtml"

interface NewRecipeBodyFieldProps {
  onChange: (state: string) => void
  fieldKey: number
}

export default function NewRecipeBodyField(p: NewRecipeBodyFieldProps) {
  function onChange(s: EditorState) {
    const html = stateToHtml(s)
    p.onChange(html)
  }

  return (
    <Card sx={{ minHeight: "160px" }} variant="outlined">
      <RichTextEditor
        label="Recipe instructions..."
        key={p.fieldKey}
        onChange={onChange}
      />
    </Card>
  )
}
