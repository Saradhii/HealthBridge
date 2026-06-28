'use client'

import { createCrudDialogContext } from '@/components/data-table'
import { type LabResult } from '../data/schema'

const { Provider: LabResultsProvider, useCrudDialog: useLabResults } =
  createCrudDialogContext<LabResult>('LabResults')

export { LabResultsProvider, useLabResults }
