const array = [1, 2, 3, 4, 5, 6, 7, 8, 'cat', 'dig', 'dog', false, true, 'str', 11, 12, 13];
const chunkSize = 3;
for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    console.log('Chunk: ', chunk);
}