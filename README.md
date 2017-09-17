marko-for-stream
==============

[![Greenkeeper badge](https://badges.greenkeeper.io/dimichgh/marko-for-stream.svg)](https://greenkeeper.io/)

A marko 4.0 component that renders async content coming from a readable stream which can be a string or an object.

### Installation

```
npm install marko-for-stream
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

In case you need to handle stream data as a group of chunks, for example to render rows in the table, you can use the `batchSize` attribute:

```marko
<for-stream(row from data.myDataStream) batchSize="3">
    <tr>
        <for(varName in row)>
            <td>${varName}</td>
        </for>
    </tr>
</for-stream>
```
