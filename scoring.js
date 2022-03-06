/**Data obtained from
 * https://www3.nd.edu/~busiforc/handouts/cryptography/letterfrequencies.html
 */
const proportions = {
    a: 43.31,
    b: 10.56,
    c: 23.13,
    d: 17.25,
    e: 56.88,
    f: 9.24,
    g: 2.59,
    h: 15.31,
    i: 38.45,
    j: 1,
    k: 5.61,
    l: 27.98,
    m: 15.36,
    n: 33.92,
    o: 36.51,
    p: 16.14,
    q: 1,
    r: 38.64,
    s: 29.23,
    t: 35.43,
    u: 18.51,
    v: 5.13,
    w: 6.57,
    x: 1.48,
    y: 9.06,
    z: 1.39
}

const hasDuplicate = word => {
    for(let i = 0; i<word.length; i++){
        for(let j = i+1; j< word.length; j++){
            if(word[i] == word[j]) {
                return true;
            }
        }
    }
    return false;
}

const calculateScore = word => {
    let sum = 0;
    for(const letter of word){
        let score = Math.pow(proportions[letter],(["a","e","i","o","u"].includes(letter) ? 1.5 : 1));
        sum += score;
    }
    return sum/word.length;
}

const orderWordsByScore = (words,noDuplicateLetters) => {
    if(noDuplicateLetters) words = words.filter(word => !hasDuplicate(word));
    const wordScorePairings = [];
    words.forEach(word => {
        wordScorePairings.push([word,calculateScore(word)])
    });
    const sorted = wordScorePairings.sort((a,b) => a[1]-b[1]);
    const extracted = [];
    sorted.forEach(pairing => extracted.unshift(pairing[0]));
    return extracted;
}