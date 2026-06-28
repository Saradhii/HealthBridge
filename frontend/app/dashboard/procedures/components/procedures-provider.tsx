'use client'

import { createCrudDialogContext } from '@/components/data-table'
import { type Procedure } from '../data/schema'

const { Provider: ProceduresProvider, useCrudDialog: useProcedures } =
  createCrudDialogContext<Procedure>('Procedures')

export { ProceduresProvider, useProcedures }
