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
            // `createResponse()`只在channel不匹配时返回null,
            // 为了能够同步返回true, 已经通过`matchChannel()`保证channel匹配, 故该断言必然成立.
            assert(isntNull(res))

            sendResponse(res)
          })

          return true
        }
      }
    }
  }
}
