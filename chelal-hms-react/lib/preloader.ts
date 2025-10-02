import { apiHelpers } from './api-client'

// List of app routes to prefetch for faster navigation
const ROUTES_TO_PREFETCH = [
  '/dashboard',
  '/patients',
  '/appointments',
  '/medications',
  '/billing',
  '/reports',
  '/settings',
]

/**
 * Preload Next.js pages using the router.prefetch API.
 * This warms up the page bundles so navigation feels instant.
 */
export async function preloadAppPages(router: any /* NextRouter-like */) {
  if (!router || typeof router.prefetch !== 'function') return

  const promises = ROUTES_TO_PREFETCH.map(async (route) => {
    try {
      // router.prefetch returns a Promise in Next.js when available
      await router.prefetch(route)
    } catch (err) {
      // Non-fatal: log and continue
      // eslint-disable-next-line no-console
      console.warn(`Failed to prefetch route ${route}:`, err)
    }
  })

  await Promise.all(promises)
}

/**
 * Prefetch critical API data used across the UI. These requests run in
 * the background and populate browser caches (or at least warm the backend).
 */
export async function prefetchCriticalData() {
  const tasks: Promise<any>[] = []

  try {
    tasks.push(apiHelpers.getProfile().catch((e: any) => { console.warn('profile prefetch failed', e) }))
    tasks.push(apiHelpers.getBillingStats().catch((e: any) => { console.warn('billing stats prefetch failed', e) }))
    tasks.push(apiHelpers.getProfile().catch((e: any) => { /* dedupe safe */ }))
    tasks.push(apiHelpers.getRoleChangeRequests?.().catch((e: any) => { /* optional endpoints */ }))
    tasks.push(apiHelpers.getDashboardStats?.().catch((e: any) => { console.warn('dashboard stats prefetch failed', e) }))
    tasks.push(apiHelpers.getPatientCount?.().catch((e: any) => { console.warn('patient count prefetch failed', e) }))
    tasks.push(apiHelpers.getAppointmentsToday?.().catch((e: any) => { console.warn('appointments today prefetch failed', e) }))
    tasks.push(apiHelpers.getTopMedications?.().catch((e: any) => { console.warn('top medications prefetch failed', e) }))
  } catch (err) {
    // If constructing tasks fails, just log and return
    // eslint-disable-next-line no-console
    console.warn('Error preparing prefetch tasks', err)
  }

  // Run tasks in parallel but don't fail the caller if any fail
  await Promise.all(tasks.map(p => p.catch((e) => e)))
}
