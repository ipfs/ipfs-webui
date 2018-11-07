import React from 'react'
import DnDBackend from './lib/dnd-backend'
import { DragDropContextProvider } from 'react-dnd'

export default function DndDecorator (fn) {
  return (
    <DragDropContextProvider backend={DnDBackend}>
      {fn()}
    </DragDropContextProvider>
  )
}
