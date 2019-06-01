# redux-storage-middleware

*Redux Storage Middleware* implements a client-side caching mechanism for _React Redux_ applications with _Sagas_.

It intercepts _Actions_ and replays others to reduce requests to the server.

## Start simply

- Import the functions

```javascript
import initialState from 'redux-storage-middleware/initial-state'
import createStorageMap from 'redux-storage-middleware/lib/storage-map'
import storage from 'redux-storage-middleware/lib/storage'
```

- Invoke `createStorageMap` with an array of configuration objects

```javascript
const storageMap = createStorageMapMiddleware([
  {
    type: 'REQUEST_PRODUCTS',
    meta: {
      type: 'REQUEST_PRODUCTS_SUCCEEDED'
      cacheFor: (1000 * 60) * 60
    }
  }
])
```

- Populate the state, mount the store and compose the middleware

```javascript
  const store = createStore(
    reducers,
    state: { 
      reduxStorage: initialState()
    },
    compose(
      applyMiddleware([
        storageMap,
        storage
      ])
    )
  )
```
## Then progress to more detail

### `initialState`

*Redux Storage Middleware* serialises the _Actions_ it observes into browser storage, if it's available. This function deserialises those _Actions_ from browser storage to hydrate the _Store_ when the application starts.

### `storageMap`

This middleware function observes _Actions_ and decides which to intercept, and what to replay. In the second step, above, it was created by passing an array of configuration objects to `createStorageMapMiddleware`.

`storageMap` is essential to *Redux Storage Middleware*.

There's more information about configuration objects below, but for now it's enough to understand that the middleware observes the _Actions_ identified by the `type` attribute and in their place replays the _Actions_ identified by the `{ meta: { type } }`, until the `{ meta: { cacheFor } }` duration has expired.

In other words: when you see _this_, replay _that_, until _such_ time has passed.

### `storage`

In Redux, all application state is kept in the _Store_, and that is the case with *Redux Storage Middleware*. But *Redux Storage Middleware* also serialises the _Actions_ it observes into browser storage, if it's available. Which mechanism an _Action_ is serialised to is determined by the `{ meta: { cacheFor } }` duration.

This middleware function decides which mechanism to use, and performs the serialisation.

- A duration of less than one hour means that the _Action_ need not be serialised to browser storage
- A duration of one hour or more but less than a day means that the _Action_ can be serialised to browser _Session Storage_
- A duration of one day or more means that the _Action_ can be serialised to browser _Local Storage_

`initialState` hydrates the Store from browser storage when the application starts. 

`storage` updates browser storage while the application is operating.

## Configuration objects

Configuration is an array of objects. 

Each object is a _map_ from one _Action_ to another:

- The _Action_ to observe is identified by the configuration object's `type` attribute
- The _Action_ to replay is described on the configuration object's `meta` attribute

But it also describes a _duration_ of time: when you see _this_, replay _that_, until _such_ time has passed.

```javascript
{
  type: 'REQUEST_PRODUCTS',
  meta: {
    type: 'REQUEST_PRODUCTS_SUCCEEDED'
    cacheFor: (1000 * 60) * 60
  }
}
```

The `meta` attribute is an object with `type` and `cacheFor` attributes.

Both `type` and `{ meta: { type } }` should identify _Actions_.

The `{ meta: { cacheFor } }` duration is in milliseconds.

Where several configuration objects refer to the same `{ meta: { type } }` the smallest `{ meta: { cacheFor } }` duration is recorded.



## With Sagas

Ensure that your `storageMap` middleware is composed into the middleware chain _before_ your `sagaMiddleware`. 

```javascript
  const store = createStore(
    reducers,
    state,
    compose(
      applyMiddleware([
        storageMap,
        storage,
        sagaMiddleware
      ])
    )
  )
```

*Sagas* observe _Actions_ of the first `type` and dispatch _Actions_ of the second `type` (after a request to the server has successfully resolved). 

*Redux Storage Middleware* intercepts _Actions_ of the first `type` and replays _Actions_ of the second `type`. 

*Redux Storage Middleware* bypasses *Sagas*, but dispatches additional actions to ensure that your application (which no doubt depends on all of its _Actions_).

## Additional actions

*Redux Storage Middleware* intercepts some _Actions_ and dispatches others.


### Step by step

1. *Redux Storage Middleware* observes and _Action_ of the first `type`
2. It interrogates the cache to se


. If it has an _Action_ of the second `type` in its cache


If it has no _Actions_ of the second `type` in state, or if it does but the duration defined by `cacheFor` has passed, then the are passes the _Action_ to the next middleware






 and replays _Actions_ of the second `type` (if the duration of time defined by `cacheFor` has not passed).



If it doesn't have any _Actions_ of the second type in its cache 

The _Action_ is replay is ide

/*
Regardless, all application state is kept in the _Store_, so you can implement *Redux Storage Middleware* using `storageMap` without `storage`, or using some other middleware in place of `storage`, but that's more work.

In Redux applications, an _Action_ is a parcel of information that is dispatched into a _Store_. On the way, the parcel can pass through a chain of handlers, called _middleware_, before eventually arriving at a _reducer_, where it is merged into the current state and kept. A _Store_ is the repository for an application's state, and an _Action_ is an update to it.

_Sagas_ observe _Actions_ to perform side-effects: asynchronously fetching information from a remote server, or storing it there, then dispatching additional _Actions_ to notify the _Store_ of those side-effects' success or failure.

*Redux Storage Middleware* also observes _Actions_ to fetch or store information, but does so synchronously, and in the client. Actions which imply an expensive remote request for infrequently changing data can be intercepted, and that data supplied from the local cache.*/

## Implementation

*Redux Storage Middleware* is comprised of four parts:

1. An `initialState` function for populating the Redux store from the client-side cache
2. A `reducer` function for updating the Redux store
3. A `storageMap` middleware function for observing _Actions_ and deciding whether to interact with the client-side cache
4. A `storage` middleware function for interacting with the client-side cache

### 1. `initialState`

Information about the client-side cache is _application state_, so it is kept in the Redux store.


But that _information about the cache_ is also _kept in the cache_, so the Redux store can be initialised with it across sessions. (There's not much point keeping something in long-term storage if you can't remember anything about it when you come back, later.)

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import {
  Provider
} from 'react-redux'

import initialState from 'redux-storage-middleware/reducer/initial-state'

import {
  configureStore
} from './app/store'

import App from './app'

const state = {
  reduxStorage: initialState()
}
const store = configureStore(state)

ReactDOM.hydrate(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

### 2. `reducer`

Information about the client-side cache kept in the Redux store is managed by the `reducer`.

```javascript
import {
  combineReducers
} from 'redux'

import reduxStorage from 'redux-storage-middleware/reducer'

export default combineReducers({ reduxStorage })
```

### 3. `storageMap`

`storageMap` decides whether an _Action_ is configured for caching, as well as _when_ and _how_ to handle an _Action_ it has observed.

```javascript
import createStorageMapMiddleware from 'redux-storage-middleware/storage-map'

const storageMapMiddleware = createStorageMapMiddleware([ /* an array of configuration objects */ ])
```

### 4. `storage`

`storage` interacts with the client-side cache.

```javascript
import storageMiddleware from 'redux-storage-middleware/storage'
```



Without configuration, `storageMap` and `storage` pass _Actions_ on to the next middleware.

In addition, there is a `reducer`, as well as a function for populating the application's _initial state_ with data from the client-side cache.

## Configuring the Redux store with `configureStore`


```javascript
import {
  createStore,
  compose,
  applyMiddleware
} from 'redux'

import createStorageMapMiddleware from 'redux-storage-middleware/storage-map'
import storageMiddleware from 'redux-storage-middleware/storage'
import createSagaMiddleware from 'redux-saga'

import reducers from './reducers' // the output of `combineReducers()`
import sagas from './sagas' // the output `rootSaga()`

export const configureStore = (state) => {
  /*
   *  Create the Storage Middleware
   */
  const storageMapMiddleware = createStorageMapMiddleware([
  	/* an array of configuration objects */
  ])

  /*
   *  Create the Saga middleware
   */
  const sagaMiddleware = createSagaMiddleware()

  /*
   *  Mount the Store and the Saga middleware
   */
  const store = createStore(
    reducers,
    state,
    compose(
      applyMiddleware([
      	storageMapMiddleware,
      	storageMiddleware,
      	sagaMiddleware
      ])
    )
  )

  /*
   *  Run the Sagas
   */
  sagaMiddleware.run(sagas)

  return store
}
```
