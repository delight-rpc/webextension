import * as DelightRPC from 'delight-rpc'
import { raceAbortSignals, timeoutSignal, withAbortSignal } from 'extra-abort'
import { isntUndefined } from '@blackglory/prelude'
import { SyncDestructor } from 'extra-defer'

export function createBackgroundClient<IAPI extends object>(
  { parameterValidators, expectedVersion, channel, timeout }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: string
    channel?: string
    timeout?: number
  } = {}
): [client: DelightRPC.ClientProxy<IAPI>, close: () => void] {
  const destructor = new SyncDestructor()

  const controller = new AbortController()
  destructor.defer(() => controller.abort())

  const port = chrome.runtime
  port.onSuspend.addListener(abortAllPendings)
  destructor.defer(() => port.onSuspend.removeListener(abortAllPendings))

  const client = DelightRPC.createClient<IAPI>(
    async function send(request, signal) {
      const destructor = new SyncDestructor()

      try {
        const mergedSignal = raceAbortSignals([
          isntUndefined(timeout) && timeoutSignal(timeout)
        , signal
        , controller.signal
        ])
        mergedSignal.addEventListener('abort', sendAbort)
        destructor.defer(() => mergedSignal.removeEventListener('abort', sendAbort))

        return await withAbortSignal(mergedSignal, () => port.sendMessage(request))
      } finally {
        destructor.execute()
      }

      async function sendAbort(): Promise<void> {
        const abort = DelightRPC.createAbort(request.id, channel)
        await port.sendMessage(abort)
      }
    }
  , {
      parameterValidators
    , expectedVersion
    , channel
    }
  )

  return [client, () => destructor.execute()]

  function abortAllPendings(): void {
    controller.abort()
  }
}

export function createTabClient<IAPI extends object>(
  target: {
    tabId: number
    frameId?: number
  }
, { parameterValidators, expectedVersion, channel, timeout }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: string
    channel?: string
    timeout?: number
  } = {}
): [client: DelightRPC.ClientProxy<IAPI>, close: () => void] {
  const destructor = new SyncDestructor()

  const controller = new AbortController()
  destructor.defer(() => controller.abort())

  const port = chrome.tabs
  port.onRemoved.addListener(onTabRemoved)
  destructor.defer(() => port.onRemoved.removeListener(onTabRemoved))

  const client = DelightRPC.createClient<IAPI>(
    async function send(request, signal) {
      const mergedSignal = raceAbortSignals([
        isntUndefined(timeout) && timeoutSignal(timeout)
      , signal
      , controller.signal
      ])
      mergedSignal.addEventListener('abort', async () => {
        const abort = DelightRPC.createAbort(request.id, channel)
        await port.sendMessage(target.tabId, abort, { frameId: target.frameId })
      })

      return await withAbortSignal(mergedSignal, () => port.sendMessage(
        target.tabId
      , request
      , { frameId: target.frameId }
      ))
    }
  , {
      parameterValidators
    , expectedVersion
    , channel
    }
  )

  return [client, close]

  function close(): void {
    destructor.execute()
  }

  function onTabRemoved(tabId: number): void {
    if (tabId === target.tabId) {
      close()
    }
  }
}

export function createBackgroundBatchClient<DataType>(
  { expectedVersion, channel, timeout }: {
    expectedVersion?: string
    channel?: string
    timeout?: number
  } = {}
): [client: DelightRPC.BatchClient<DataType>, close: () => void] {
  const destructor = new SyncDestructor()

  const controller = new AbortController()
  destructor.defer(() => controller.abort())

  const port = chrome.runtime
  port.onSuspend.addListener(abortAllPendings)
  destructor.defer(() => port.onSuspend.removeListener(abortAllPendings))

  const client = new DelightRPC.BatchClient<DataType>(
    async function send(request) {
      const destructor = new SyncDestructor()

      try {
        const mergedSignal = raceAbortSignals([
          isntUndefined(timeout) && timeoutSignal(timeout)
        , controller.signal
        ])
        mergedSignal.addEventListener('abort', sendAbort)
        destructor.defer(() => mergedSignal.removeEventListener('abort', sendAbort))

        return await withAbortSignal(mergedSignal, () => port.sendMessage(request))
      } finally {
        destructor.execute()
      }

      async function sendAbort(): Promise<void> {
        const abort = DelightRPC.createAbort(request.id, channel)
        await port.sendMessage(abort)
      }
    }
  , {
      expectedVersion
    , channel
    }
  )

  return [client, () => destructor.execute()]

  function abortAllPendings(): void {
    controller.abort()
  }
}

export function createTabBatchClient<DataType>(
  target: {
    tabId: number
    frameId?: number
  }
, { expectedVersion, channel, timeout }: {
    expectedVersion?: string
    channel?: string
    timeout?: number
  } = {}
): [client: DelightRPC.BatchClient<DataType>, close: () => void] {
  const destructor = new SyncDestructor()

  const controller = new AbortController()
  destructor.defer(() => controller.abort())

  const port = chrome.tabs
  port.onRemoved.addListener(onTabRemoved)
  destructor.defer(() => port.onRemoved.removeListener(onTabRemoved))

  const client = new DelightRPC.BatchClient<DataType>(
    async function send(request) {
      const destructor = new SyncDestructor()

      try {
        const mergedSignal = raceAbortSignals([
          isntUndefined(timeout) && timeoutSignal(timeout)
        , controller.signal
        ])
        mergedSignal.addEventListener('abort', sendAbort)
        destructor.defer(() => mergedSignal.removeEventListener('abort', sendAbort))

        return await withAbortSignal(mergedSignal, () => port.sendMessage(
          target.tabId
        , request
        , { frameId: target.frameId }
        ))
      } finally {
        destructor.execute()
      }

      async function sendAbort(): Promise<void> {
        const abort = DelightRPC.createAbort(request.id, channel)
        await port.sendMessage(target.tabId, abort, { frameId: target.frameId })
      }
    }
  , {
      expectedVersion
    , channel
    }
  )

  return [client, close]

  function close(): void {
    destructor.execute()
  }

  function onTabRemoved(tabId: number): void {
    if (tabId === target.tabId) {
      close()
    }
  }
}
