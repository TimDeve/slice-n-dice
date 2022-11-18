import { Card } from "@mui/material"
import type { EditorState, RawDraftContentState } from "draft-js"

import RichTextEditor from "../shared/text-editor/RichTextEditor"
import stateToHtml from "../shared/text-editor/stateToHtml"

interface NewRecipeBodyFieldProps {
  onChange: (state: string) => void
  fieldKey?: number
  defaultValue?: RawDraftContentState
}

export default function NewRecipeBodyField(p: NewRecipeBodyFieldProps) {
  function onChange(s: EditorState) {
    const html = stateToHtml(s)
    p.onChange(html)
  }

  return (
    <Card sx={{ minHeight: "160px", flexGrow: 1 }} variant="outlined">
      <RichTextEditor
        label="Recipe instructions..."
        key={p.fieldKey}
        onChange={onChange}
        defaultValue={p.defaultValue}
      />
    </Card>
  )
}
