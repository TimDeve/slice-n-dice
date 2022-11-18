import CloseIcon from "@mui/icons-material/Close"
import EditIcon from "@mui/icons-material/Edit"
import {
  Box,
  DialogTitle,
  IconButton,
} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import {
  ContentState,
  RawDraftContentState,
  convertFromHTML,
  convertToRaw,
} from "draft-js"

import * as gateway from "../gateway"
import LoadingText from "../shared/LoadingText"
import RichTextEditor from "../shared/text-editor/RichTextEditor"
import { VoidFn } from "../shared/typeUtils"

function TitleBar(p: { children: string; onClose: VoidFn }) {
  return (
    <DialogTitle sx={{ paddingBottom: 0 }}>
      {p.children}
      <IconButton
        aria-label="edit"
        onClick={p.onClose}
        sx={{
          position: "absolute",
          right: 52,
          top: 8,
          color: theme => theme.palette.grey[500],
        }}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        aria-label="close"
        onClick={p.onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  )
}

function htmlToRteDefaultValue(html: string): RawDraftContentState {
  const fromHtml = convertFromHTML(html)
  const state = ContentState.createFromBlockArray(
    fromHtml.contentBlocks,
    fromHtml.entityMap
  )
  return convertToRaw(state)
}

export default function ViewRecipe(p: { recipeId: string; onClose: VoidFn }) {
  const { isLoading, error, data } = useQuery(
    [gateway.getRecipe.name, p.recipeId],
    () => gateway.getRecipe(p.recipeId)
  )

  if (isLoading) return <LoadingText />

  if (error || data === undefined) return <>Error...</>

  return (
    <section style={{display: "flex", "flexDirection": "column", height: "100%"}}>
      <TitleBar onClose={p.onClose}>{data.name}</TitleBar>
      <Box sx={{ paddingLeft: "12px", paddingRight: "12px", flex: 1, overflow: "auto"  }}>
        <RichTextEditor
          readOnly
          toolbar={false}
          defaultValue={htmlToRteDefaultValue(data.body)}
        />
      </Box>
    </section>
  )
}
