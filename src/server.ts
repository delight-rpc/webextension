import * as DelightRPC from 'delight-rpc'
import { assert, go, isntNull } from '@blackglory/prelude'
import { HashMap } from '@blackglory/structures'
import { SyncDestructor } from 'extra-defer'

export function createServer<IAPI extends object>(
  api: DelightRPC.ImplementationOf<IAPI>
, { parameterValidators, version, channel, ownPropsOnly }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    version?: `${number}.${number}.${number}`
    channel?: string | RegExp | typeof DelightRPC.AnyChannel
    ownPropsOnly?: boolean
  } = {}
): () => void {
  const destructor = new SyncDestructor()

  const channelIdToController: HashMap<
    {
      channel?: string
    , id: string
    }
  , AbortController
  > = new HashMap(({ channel, id }) => JSON.stringify([channel, id]))
  destructor.defer(abortAllPendings)

  const port = chrome.runtime
  port.onSuspend.addListener(abortAllPendings)
  destructor.defer(() => port.onSuspend.removeListener(abortAllPendings))

  port.onMessage.addListener(receive)
  destructor.defer(() => port.onMessage.removeListener(receive))

  return () => destructor.execute()

  function abortAllPendings(): void {
    for (const controller of channelIdToController.values()) {
      controller.abort()
    }

    channelIdToController.clear()
  }

  function receive(
    message: unknown
  , sender: chrome.runtime.MessageSender
  , sendResponse: (response?: unknown) => void
  ): void | true {
    if (sender.id === chrome.runtime.id) {
      if (DelightRPC.isRequest(message) || DelightRPC.isBatchRequest(message)) {
        if (DelightRPC.matchChannel(message, channel)) {
          go(async () => {
            const destructor = new SyncDestructor()

            try {
              const controller = new AbortController()
              channelIdToController.set(message, controller)
              destructor.defer(() => channelIdToController.delete(message))

              const res = await DelightRPC.createResponse(
                api
              , message
              , {
                  parameterValidators
                , version
                , channel
                , ownPropsOnly
                , signal: controller.signal
                }
              )
              // `createResponse()`只在channel不匹配时返回null,
              // 为了能够同步返回true, 已经通过`matchChannel()`保证channel匹配, 故该断言必然成立.
              assert(isntNull(res))

              sendResponse(res)
            } finally {
              destructor.execute()
            }
          })

          return true
        }
      } else if (DelightRPC.isAbort(message)) {
        if (DelightRPC.matchChannel(message, channel)) {
          channelIdToController.get(message)?.abort()
          channelIdToController.delete(message)
        }
      }
    }
  }
}
