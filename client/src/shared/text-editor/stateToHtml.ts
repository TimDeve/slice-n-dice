import type { EditorState } from "draft-js"
import { stateToHTML } from "draft-js-export-html"

import { headerThree } from "../text-editor/customBlock"

const options = {
  blockRenderers: {
    [headerThree.name]: headerThree.renderer,
  },
}

export default function stateToHtml(s: EditorState) {
  return stateToHTML(s.getCurrentContent(), options)
}
