// Typed versions of the two react-redux hooks.
// In components, use these instead of plain useDispatch / useSelector.
//
//   useAppSelector(fn)  -> READ a value from the store
//   useAppDispatch()    -> get `dispatch`, used to SEND an action (e.g. loadPosts())

import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
