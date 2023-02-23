import browser from 'webextension-polyfill'
import * as DelightRPC from 'delight-rpc'
import { go, isntNull } from '@blackglory/prelude'

export function createServer<IAPI extends object>(
  api: DelightRPC.ImplementationOf<IAPI>
, { parameterValidators, version, channel, ownPropsOnly }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    version?: `${number}.${number}.${number}`
    channel?: string | RegExp | typeof DelightRPC.AnyChannel
    ownPropsOnly?: boolean
  } = {}
): () => void {
  const port = browser.runtime

  port.onMessage.addListener(handler)
  return () => port.onMessage.removeListener(handler)

  function handler(
    message: unknown
  , sender: browser.Runtime.MessageSender
  ): void | Promise<unknown> {
    if (sender.id === browser.runtime.id) {
      const req = message

      if (DelightRPC.isRequest(req) || DelightRPC.isBatchRequest(req)) {
        if (DelightRPC.matchChannel(req, channel)) {
          return go(async () => {
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

            if (isntNull(res)) {
              return res
            }
          })
        }
      }
    }
  }
}
