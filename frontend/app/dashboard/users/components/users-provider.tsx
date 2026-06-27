'use client'

import { createCrudDialogContext } from '@/components/data-table'
import { type User } from '../data/schema'

const { Provider: UsersProvider, useCrudDialog: useUsers } =
  createCrudDialogContext<User>('Users')

export { UsersProvider, useUsers }
