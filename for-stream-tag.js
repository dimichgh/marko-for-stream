'use strict';

module.exports = function (input, out) {
    const stream = input._dataProvider;
    // This async fragment doesn't have timeout handling
    let asyncOut = out.beginAsync({timeout: input.timeout, 'name': input});

    stream.on('data', data => {
        input.renderBody && input.renderBody(asyncOut, data);
        asyncOut.flush();
    });
    stream.on('end', handleEnd);
    stream.on('error', handleEnd);

    function handleEnd(err) {
        if (asyncOut) {
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
