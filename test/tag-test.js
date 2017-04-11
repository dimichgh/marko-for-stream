'use strict';

const Assert = require('assert');
const Fs = require('fs');
const template = require('marko').load(require.resolve('./for.marko'));
const oja = require('oja');

describe.only(__filename, () => {

    after(() => {
        try {
            Fs.unlinkSync(require.resolve('./for.marko.js'));
        } catch (e) {
        }
    });

    it('should render stream data', function (next) {
        this.timeout(1000);

        const flow = new oja.Flow();
        flow.define('topic', 'A');
        flow.define('topic', 'B');
        flow.define('topic', 'C');
        template.renderToString({
            myDataStream: flow.consumeStream('topic')
        }, (err, html) => {
            Assert.ok(!err, err && err.stack);
            Assert.equal('<div>A</div><div>B</div><div>C</div><div>D</div>', html);
            next();
        });

        setImmediate(() => {
            flow.define('topic', 'D');
            setImmediate(() => {
                // mark end of stream
                flow.define('topic', null);
            });
        });

    });

    it('should handle timeout', function (next) {
        this.timeout(1000);

        const flow = new oja.Flow();
        flow.define('topic', 'A');
        flow.define('topic', 'B');
        flow.define('topic', 'C');
        template.renderToString({
            myDataStream: flow.consumeStream('topic')
        }, (err, html) => {
            setImmediate(() => {
                Assert.ok(err);
                Assert.ok(err.message.indexOf('timed out after 500ms') !== -1);
                next();
            });
        });
        // never finish the stream
    });

    it('should handle stream error', function (next) {
        this.timeout(1000);

        const flow = new oja.Flow();
        flow.define('topic', 'A');
        flow.define('topic', 'B');
        flow.define('topic', 'C');
        const stream = flow.consumeStream('topic');
        template.renderToString({
            myDataStream: stream
        }, (err, html) => {
            setImmediate(() => {
                Assert.ok(err);
                Assert.ok(err.message.indexOf('Exception: Error: Boom') !== -1);
                next();
            });
        });
        flow.catch(() => {});
        // never finish the stream
        setImmediate(() => {
            stream.emit('error', new Error('Boom'));
        });
    });
});
