'use client'

import DashboardNotFound from '../not-found'

export default function CatchAllNotFound() {
  // This will catch any unmatched routes under /dashboard
  // and render the custom 404 page with sidebar
  return <DashboardNotFound />
}