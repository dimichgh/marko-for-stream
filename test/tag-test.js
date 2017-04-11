'use strict';

const Assert = require('assert');
const Fs = require('fs');
const oja = require('oja');

describe(__filename, () => {

    after(() => {
        try {
            Fs.unlinkSync(require.resolve('./for.marko.js'));
        } catch (e) {
        }
    });

    it('should render stream data', function (next) {
        this.timeout(1000);
        const template = require('marko').load(require.resolve('./for.marko'));

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

    describe('batch size', () => {
        it('should render stream data with batch size non-evenly divisible', function (next) {
            this.timeout(1000);
            const template = require('marko').load(require.resolve('./for-batch-noneven.marko'));

            const flow = new oja.Flow();
            flow.define('topic', 'A');
            flow.define('topic', 'B');
            flow.define('topic', 'C');
            template.renderToString({
                myDataStream: flow.consumeStream('topic')
            }, (err, html) => {
                Assert.ok(!err, err && err.stack);
                Assert.equal('<tr><td>A</td><td>B</td><td>C</td></tr><tr><td>D</td></tr>', html);
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

        it('should render stream data with batch size evenly divisible', function (next) {
            this.timeout(1000);
            const template = require('marko').load(require.resolve('./for-batch-even.marko'));

            const flow = new oja.Flow();
            flow.define('topic', 'A');
            flow.define('topic', 'B');
            flow.define('topic', 'C');
            template.renderToString({
                myDataStream: flow.consumeStream('topic')
            }, (err, html) => {
                Assert.ok(!err, err && err.stack);
                Assert.equal('<tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr>', html);
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
    });

    it('should handle timeout', function (next) {
        this.timeout(1000);
        const template = require('marko').load(require.resolve('./for.marko'));

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
        const template = require('marko').load(require.resolve('./for.marko'));

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

    it('should handle invalid tag', function (next) {
        try {
            require('marko').load(require.resolve('./for-invalid.marko'));
        }
        catch (err) {
            Assert.ok(err.message.indexOf('Invalid <for-stream> tag. Argument is missing') !== -1);
            next();
        }
    });

    it('should handle malformed tag', function (next) {
        try {
            require('marko').load(require.resolve('./for-malformed.marko'));
        }
        catch (err) {
            Assert.ok(err.message.indexOf('Invalid <for-stream> tag. Argument is malformed. Example: <for-stream(data from data.userStream)>') !== -1);
            next();
        }
    });

    it('should handle invalid identifier in the tag', function (next) {
        try {
            require('marko').load(require.resolve('./for-invalid-identifier.marko'));
        }
        catch (err) {
            Assert.ok(err.message.indexOf('Invalid <for-stream> tag. Argument is malformed. Example: <for-stream(data from data.userStream)>') !== -1);
            next();
        }
    });
});
