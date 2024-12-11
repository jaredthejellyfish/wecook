import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useRealtimeBatch } from '@trigger.dev/react-hooks'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { z } from 'zod'

const SearchSchema = z.object({
  batchId: z.string(),
  publicAccessToken: z.string(),
})  

export const Route = createFileRoute('/(app)/generating/batch/')({
  component: BatchGeneratingPage,
  validateSearch: (search) => {
    const parsedSearch = SearchSchema.parse(search)
    return {
      batchId: parsedSearch.batchId,
      publicAccessToken: parsedSearch.publicAccessToken,
    }
  },
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-500 bg-green-50 dark:bg-green-900/20'
    case 'FAILED':
    case 'CRASHED':
    case 'INTERRUPTED':
    case 'SYSTEM_FAILURE':
      return 'text-red-500 bg-red-50 dark:bg-red-900/20'
    case 'WAITING_FOR_DEPLOY':
    case 'QUEUED':
    case 'EXECUTING':
    case 'REATTEMPTING':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
    default:
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
  }
}

const getStatusIcon = (status: string) => {
  const iconClass = 'w-5 h-5'
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className={iconClass} />
    case 'FAILED':
    case 'CRASHED':
    case 'INTERRUPTED':
    case 'SYSTEM_FAILURE':
      return <XCircle className={iconClass} />
    case 'WAITING_FOR_DEPLOY':
    case 'QUEUED':
    case 'EXECUTING':
    case 'REATTEMPTING':
      return <Clock className={iconClass} />
    default:
      return <AlertTriangle className={iconClass} />
  }
}

function BatchRunCard({ run }: { run: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-neutral-800/50 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(run.status)}`}
          >
            {getStatusIcon(run.status)}
            <span>{run.status}</span>
          </span>
          <span className="font-mono text-sm text-neutral-500 dark:text-neutral-400">
            {run.id}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Run Number
              </p>
              <p className="mt-1 font-mono text-sm">{run.number}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Timeline</h4>
            <div className="space-y-2">
              {[
                { label: 'Created', time: run.createdAt },
                { label: 'Queued', time: run.queuedAt },
                { label: 'Started', time: run.startedAt },
                { label: 'Finished', time: run.finishedAt },
              ].map(
                (item, index) =>
                  item.time && (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-neutral-800"
                    >
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {item.label}
                      </span>
                      <span className="text-sm font-mono">
                        {new Date(item.time).toLocaleString()}
                      </span>
                    </div>
                  ),
              )}
            </div>
          </div>

          {run.error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <h4 className="text-red-900 dark:text-red-200 font-semibold text-sm mb-2">
                Error Details
              </h4>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {run.error.message}
              </p>
              {run.error.stackTrace && (
                <pre className="mt-2 p-2 rounded bg-red-100 dark:bg-red-900/40 text-xs overflow-x-auto">
                  {run.error.stackTrace}
                </pre>
              )}
            </div>
          )}

          {run?.output?.recipeId && (
            <div className="flex justify-end">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Link
                  to={`/recipes/$id`}
                  params={{ id: run.output.recipeId.toString() }}
                  className="flex items-center gap-2"
                >
                  View Recipe
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BatchGeneratingPage() {
  const { batchId, publicAccessToken } = Route.useSearch()

  const { runs, error } = useRealtimeBatch(batchId ?? '', {
    accessToken: publicAccessToken ?? '',
    enabled: !!batchId && !!publicAccessToken,
  })

  // Calculate overall status
  const completedRuns =
    runs?.filter((run) => run.status === 'COMPLETED')?.length ?? 0
  const totalRuns = runs?.length ?? 0
  const progress =
    totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Batch Generation Status
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Track the progress of your batch content generation
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <div className="flex gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Error Occurred
              </h3>
              <p className="text-red-700 dark:text-red-300 mt-1">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {runs && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800/50 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Batch Progress</h2>
              <span className="text-lg font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {completedRuns} of {totalRuns} runs completed
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Individual Runs</h2>
            {runs.map((run) => (
              <BatchRunCard key={run.id} run={run} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchGeneratingPage
