import browser from 'webextension-polyfill'
import * as DelightRPC from 'delight-rpc'
import { IBatchRequest, IRequest } from '@delight-rpc/protocol'

export function createBackgroundClient<IAPI extends object>(
  { parameterValidators, expectedVersion, channel }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: string
    channel?: string
  } = {}
): DelightRPC.ClientProxy<IAPI> {
  const port = browser.runtime

  const client = DelightRPC.createClient<IAPI>(
    async function send(request: IRequest<unknown>) {
      return await port.sendMessage(request)
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
, { parameterValidators, expectedVersion, channel }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: string
    channel?: string
  } = {}
): DelightRPC.ClientProxy<IAPI> {
  const port = browser.tabs

  const client = DelightRPC.createClient<IAPI>(
    async function send(request: IRequest<unknown>) {
      return await port.sendMessage(
        target.tabId
      , request
      , { frameId: target.frameId }
      )
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
  { expectedVersion, channel }: {
    expectedVersion?: string
    channel?: string
  } = {}
): DelightRPC.BatchClient<DataType> {
  const port = browser.runtime

  const client = new DelightRPC.BatchClient<DataType>(
    async function send(request: IBatchRequest<unknown>) {
      return await port.sendMessage(request)
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
, { expectedVersion, channel }: {
    expectedVersion?: string
    channel?: string
  } = {}
): DelightRPC.BatchClient<DataType> {
  const port = browser.tabs

  const client = new DelightRPC.BatchClient<DataType>(
    async function send(request: IBatchRequest<unknown>) {
      return await port.sendMessage(
        target.tabId
      , request
      , { frameId: target.frameId }
      )
    }
  , {
      expectedVersion
    , channel
    }
  )

  return client
}
