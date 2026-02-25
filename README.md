# @delight-rpc/webextension
## Install
```sh
npm install --save @delight-rpc/webextension
# or
yarn add @delight-rpc/webextension
```

## API
### createBackgroundClient
```ts
function createBackgroundClient<IAPI extends object>(
  options?: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: string
    channel?: string
    timeout?: number
  }
): [client: DelightRPC.ClientProxy<IAPI>, close: () => void]
```

### createTabClient
```ts
function createTabClient<IAPI extends object>(
  target: {
    tabId: number
    frameId?: number
  }
, options?: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: string
    channel?: string
    timeout?: number
  }
): [client: DelightRPC.ClientProxy<IAPI>, close: () => void]
```

### createBackgroundBatchClient
```ts
function createBackgroundBatchClient<DataType>(
  options?: {
    expectedVersion?: string
    channel?: string
    timeout?: number
  }
): [client: DelightRPC.BatchClient<DataType>, close: () => void]
```

### createTabBatchClient
```ts
function createTabBatchClient<DataType>(
  target: {
    tabId: number
    frameId?: number
  }
, options?: {
    expectedVersion?: string
    channel?: string
    timeout?: number
  }
): [client: DelightRPC.BatchClient<DataType>, close: () => void]
```

### createServer
```ts
function createServer<IAPI extends object>(
  api: DelightRPC.ImplementationOf<IAPI>
, { parameterValidators, version, channel, ownPropsOnly }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    version?: `${number}.${number}.${number}`
    channel?: string | RegExp | typeof DelightRPC.AnyChannel
    ownPropsOnly?: boolean
  } = {}
): () => void
```
