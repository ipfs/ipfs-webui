import React from 'react'
import DnDBackend from './lib/dnd-backend'
import { DndProvider } from 'react-dnd'
export default function DndDecorator (fn) {
  return (<DndProvider backend={DnDBackend}>
      {fn()}
    </DndProvider>)
}
