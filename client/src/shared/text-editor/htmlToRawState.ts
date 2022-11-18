import {
  ContentState,
  RawDraftContentState,
  convertFromHTML,
  convertToRaw,
} from "draft-js"

export default function htmlToRawState(html: string): RawDraftContentState {
  const fromHtml = convertFromHTML(html)
  const state = ContentState.createFromBlockArray(
    fromHtml.contentBlocks,
    fromHtml.entityMap
  )
  return convertToRaw(state)
}
