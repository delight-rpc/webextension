import * as DelightRPC from 'delight-rpc'
import { assert, go, isntNull } from '@blackglory/prelude'

export function createServer<IAPI extends object>(
  api: DelightRPC.ImplementationOf<IAPI>
, { parameterValidators, version, channel, ownPropsOnly }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    version?: `${number}.${number}.${number}`
    channel?: string | RegExp | typeof DelightRPC.AnyChannel
    ownPropsOnly?: boolean
  } = {}
): () => void {
  const port = chrome.runtime

  port.onMessage.addListener(handler)
  return () => port.onMessage.removeListener(handler)

  function handler(
    message: unknown
  , sender: chrome.runtime.MessageSender
  , sendResponse: (response?: unknown) => void
  ): void | true {
    if (sender.id === chrome.runtime.id) {
      const req = message

      if (DelightRPC.isRequest(req) || DelightRPC.isBatchRequest(req)) {
        if (DelightRPC.matchChannel(req, channel)) {
          go(async () => {
            const res = await DelightRPC.createResponse(
              api
            , req
            , {
                parameterValidators
              , version
              , channel
              , ownPropsOnly
              }
            )
            assert(isntNull(res))

            sendResponse(res)
          })

          return true
        }
      }
    }
  }
}
