class Predictions {
    constructor(domNode) {
        this.domNode = domNode;
        this.trie = new Node('😉', false);
        this.keyMap = [
            '',
            '.-\'',
            'abc',
            'def',
            'ghi',
            'jkl',
            'mno',
            'pqrs',
            'tuv',
            'wxyz',
        ].map(string => string.split(''));
    }

    addWords(words) {
        words.forEach(this.addWord.bind(this));
    }

    addWord(word) {
        this.trie.add(word);
    }

    search(word) {
        const possibilities = word.split('').map(number => this.keyMap[number]);
        const results = this.trie.search(possibilities);
        this.render(results);
    }

    render(results) {
        let html = results.words.join('</div><div class="result">');
        if (html) {
            html = '<div class="result">' + html + '</div>';
        } else {
            html = 'No results';
        }

        this.domNode.innerHTML = html;
    }
}

class Node {
    constructor(letter) {
        this.children = {};
        this.letter = letter;
        this.terminator = false;
    }

    add(word) {
        if (!word) {
            return;
        }

        const limit = word.length - 1;
        let parent = this;
        for (let i = 0; i <= limit; i++) {

            // Find or create node
            const letter = word[i].toLowerCase();
            let node = parent.children[letter];
            if (!node) {
                node = new Node(letter);
                parent.children[letter] = node;
            }

            // Update terminator
            node.terminator = (i === limit);

            // Prepare
            parent = node;

        }
    }

    search(possibilities, results = { finished: false, limit: 10, words: [] }, substring = '') {
        if (results.finished) {
            return;
        }

        if (possibilities.length === 0) {
            this.collect(results, substring);
            return;
        }

        const letters = possibilities[0] || [];
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            if (letter in this.children) {
                this.children[letter].search(possibilities.slice(1), results, substring + letter);
            }
        }

        return results;
    }

    collect(results, substring) {
        if (results.finished) {
            return;
        }

        if (this.terminator) {
            results.words.push(substring);

            if (results.words.length >= results.limit) {
                results.finished = true;
                return;
            }
        }

        for (let letter in this.children) {
            this.children[letter].collect(results, substring + letter);
        }
    }
}


/*
DOM
*/

const elements = {};
elements.input = document.querySelector('input');
elements.results = document.querySelector('.results');

let lastInput = '';

elements.input.addEventListener('keyup', e => {
    const input = e.target.value;
    if (input.length === 0) {
        lastInput = '';
        elements.results.textContent = 'Please type a number to begin';
        return;
    }
    if (input === lastInput) {
        return;
    }
    lastInput = input;

    predictions.search(input);

});

elements.results.addEventListener('click', e => {
    if (e.target.className.split(' ').indexOf('result') !== -1) {
        if (speechSynthesis.pending) {
            return;
        }

        const utterance = new SpeechSynthesisUtterance(e.target.textContent);
        speechSynthesis.speak(utterance);
    }
});


/*
AJAX
*/

function request(url, callback) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader(
        'Hay',
        'Hayyy'
    );
    request.onreadystatechange = e => {
        if (request.readyState !== 4 || request.status !== 200) {
            return;
        }

        callback(request.responseText);
    };
    request.send();
}


/*
Begin
*/

// Instantiate
const predictions = new Predictions(elements.results);

// Request male names
request('./data/names-male.txt', names => {
    predictions.addWords(names.split('\n').slice(0, 100));
});

// Request female names
request('./data/names-female.txt', names => {
    predictions.addWords(names.split('\n').slice(0, 100));
});

// Print Trie structure as JSON
setTimeout(f => {
    console.log(JSON.stringify(predictions.trie));
}, 1000);
