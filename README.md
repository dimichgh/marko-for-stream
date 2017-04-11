for-stream
==============

A marko 4.0 component that renders async content coming from readable stream which can be string or object.

### Install

```
npm install for-stream
```

### Usage

```marko
<for-stream(varName from data.myDataStream) timeout="500">
    <div>${varName}</div>
</for-stream>
```

```js
template.render({
    myDataStream: stream
}, response)
```
# for-stream
