import type { RawDraftContentState } from "draft-js"
import MUIRichTextEditor, { TMUIRichTextEditorProps } from "mui-rte"
import { useMemo } from "react"

import { headerThree } from "./customBlock"

type RichTextEditorProps = Omit<TMUIRichTextEditorProps, "defaultValue"> & {
  defaultValue?: RawDraftContentState
}

export default function RichTextEditor(p: RichTextEditorProps) {
  const hasDefaultValue: boolean = !!p.defaultValue
  const defaultValue = useMemo(
    () => (hasDefaultValue ? JSON.stringify(p.defaultValue) : undefined),
    [hasDefaultValue]
  )

  return (
    <MUIRichTextEditor
      controls={[
        headerThree.name,
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "link",
        "numberList",
        "bulletList",
      ]}
      inlineToolbar={true}
      customControls={[headerThree]}
      toolbarButtonSize="small"
      {...p}
      defaultValue={defaultValue}
    />
  )
}
