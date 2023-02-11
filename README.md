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
  }
): DelightRPC.ClientProxy<IAPI>
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
  }
): DelightRPC.ClientProxy<IAPI>
```

### createBackgroundBatchClient
```ts
function createBackgroundBatchClient<DataType>(
  options?: {
    expectedVersion?: string
    channel?: string
  }
): DelightRPC.BatchClient<DataType>
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
  }
): DelightRPC.BatchClient<DataType>
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
