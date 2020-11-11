
const { Writable } = require('stream');

function getStreamChunk() {
    var object = {
        chunks: [],
        stream: undefined
    };
    const stream = new Writable({
        write(chunk, encoding, callback) {
            object.chunks.push(chunk.toString());
            callback();
        }
    });
    object.stream = stream;
    return object;
}

module.exports = {
    getStreamChunk
};