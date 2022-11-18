import CloseIcon from "@mui/icons-material/Close"
import EditIcon from "@mui/icons-material/Edit"
import { Box, DialogTitle, IconButton } from "@mui/material"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ContentState,
  RawDraftContentState,
  convertFromHTML,
  convertToRaw,
} from "draft-js"
import { useMemo, useState } from "react"

import * as gateway from "../gateway"
import LoadingText from "../shared/LoadingText"
import Nbsp from "../shared/Nbsp"
import RichTextEditor from "../shared/text-editor/RichTextEditor"
import htmlToRawState from "../shared/text-editor/htmlToRawState"
import { VoidFn } from "../shared/typeUtils"
import EditRecipeForm from "./EditRecipeForm"

function TitleBar(p: {
  children: React.ReactNode
  onClose: VoidFn
  onEdit: VoidFn
}) {
  return (
    <DialogTitle sx={{ paddingBottom: 0 }}>
      {p.children || <Nbsp />}
      <IconButton
        aria-label="edit"
        onClick={p.onEdit}
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

export default function ViewRecipe(p: { recipeId: string; onClose: VoidFn }) {
  const [editing, setEditing] = useState(false)
  const queryClient = useQueryClient()
  const { isLoading, error, data, dataUpdatedAt } = useQuery(
    [gateway.getRecipe.name, p.recipeId],
    () => gateway.getRecipe(p.recipeId)
  )

  if (isLoading) return <LoadingText />

  if (error || data === undefined) return <>Error...</>

  function onSuccessfulEditing() {
      queryClient.invalidateQueries([gateway.getRecipes.name])
      queryClient.invalidateQueries([gateway.getRecipe.name, p.recipeId])
      setEditing(false)
  }

  return (
    <section
      style={{ display: "flex", flexDirection: "column", maxHeight: "100%" }}
    >
      <TitleBar onClose={p.onClose} onEdit={() => setEditing(e => !e)}>
        {!editing && data.name}
      </TitleBar>
      {editing ? (
        <EditRecipeForm recipe={data} onSuccess={onSuccessfulEditing} />
      ) : (
        <Box
          sx={{
            paddingLeft: "12px",
            paddingRight: "12px",
            flex: 1,
            overflow: "auto",
          }}
        >
          <RichTextEditor
            readOnly
            toolbar={false}
            key={dataUpdatedAt}
            defaultValue={htmlToRawState(data.body)}
          />
        </Box>
      )}
    </section>
  )
}
