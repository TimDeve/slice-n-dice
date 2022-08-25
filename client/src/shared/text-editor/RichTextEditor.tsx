import type { RawDraftContentState } from "draft-js"
import MUIRichTextEditor, { TMUIRichTextEditorProps } from "mui-rte"

import { headerThree } from "./customBlock"

type RichTextEditorProps = Omit<TMUIRichTextEditorProps, "defaultValue"> & {
  defaultValue?: RawDraftContentState
}

export default function RichTextEditor(p: RichTextEditorProps) {
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
      defaultValue={p.defaultValue && JSON.stringify(p.defaultValue)}
    />
  )
}
