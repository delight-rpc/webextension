import * as DelightRPC from 'delight-rpc'
import { raceAbortSignals, timeoutSignal, withAbortSignal } from 'extra-abort'
import { isntUndefined } from '@blackglory/prelude'

export function createBackgroundClient<IAPI extends object>(
  { parameterValidators, expectedVersion, channel, timeout }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: string
    channel?: string
    timeout?: number
  } = {}
): DelightRPC.ClientProxy<IAPI> {
  const port = chrome.runtime

  const client = DelightRPC.createClient<IAPI>(
    async function send(request, signal) {
      const mergedSignal = raceAbortSignals([
        isntUndefined(timeout) && timeoutSignal(timeout)
      , signal
      ])
      mergedSignal.addEventListener('abort', async () => {
        const abort = DelightRPC.createAbort(request.id, channel)
        await port.sendMessage(abort)
      })

      return await withAbortSignal(mergedSignal, () => port.sendMessage(request))
    }
  , {
      parameterValidators
    , expectedVersion
    , channel
    }
  )

  return client
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
): DelightRPC.ClientProxy<IAPI> {
  const port = chrome.tabs

  const client = DelightRPC.createClient<IAPI>(
    async function send(request, signal) {
      const mergedSignal = raceAbortSignals([
        isntUndefined(timeout) && timeoutSignal(timeout)
      , signal
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

  return client
}

export function createBackgroundBatchClient<DataType>(
  { expectedVersion, channel, timeout }: {
    expectedVersion?: string
    channel?: string
    timeout?: number
  } = {}
): DelightRPC.BatchClient<DataType> {
  const port = chrome.runtime

  const client = new DelightRPC.BatchClient<DataType>(
    async function send(request) {
      const mergedSignal = raceAbortSignals([
        isntUndefined(timeout) && timeoutSignal(timeout)
      ])
      mergedSignal.addEventListener('abort', async () => {
        const abort = DelightRPC.createAbort(request.id, channel)
        await port.sendMessage(abort)
      })

      return await withAbortSignal(mergedSignal, () => port.sendMessage(request))
    }
  , {
      expectedVersion
    , channel
    }
  )

  return client
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
): DelightRPC.BatchClient<DataType> {
  const port = chrome.tabs

  const client = new DelightRPC.BatchClient<DataType>(
    async function send(request) {
      const mergedSignal = raceAbortSignals([
        isntUndefined(timeout) && timeoutSignal(timeout)
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
      expectedVersion
    , channel
    }
  )

  return client
}
