'use strict';

module.exports = function (input, out) {
    const stream = input._dataProvider;
    // This async fragment doesn't have timeout handling
    let asyncOut = out.beginAsync({timeout: input.timeout, 'name': input});
    const batchSize = input.batchSize || 1;
    let buffer = [];

    stream.on('data', data => {
        if (batchSize > 1) {
            buffer.push(data);
            if (batchSize > buffer.length) {
                return;
            }
        }

        input.renderBody && input.renderBody(asyncOut,
            batchSize > 1 ? buffer : data);

        buffer = [];

        asyncOut.flush();
    });
    stream.on('end', handleEnd);
    stream.on('error', handleEnd);

    function handleEnd(err) {
        if (asyncOut) {
            if (buffer.length > 0 && input.renderBody) {
                input.renderBody(asyncOut,
                    buffer);
                asyncOut.flush();
            }

            let out = asyncOut;
            asyncOut = undefined;
            if (err) {
                out.error(err);
                return;
            }
            out.end();
        }
    }
};
