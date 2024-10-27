let prevFileContents = null;
let currentFileContents = null;
let resultFileContents = null;

const compareBtn = document.getElementById('openInNewTab');

// Функция для обработки события изменения файла
function onPrevFileChange(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            prevFileContents = event.target.result;
        };
        reader.readAsText(file);
    }
}

// Функция для обработки события изменения файла
function onCurrentFileChange(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            currentFileContents = event.target.result;
        };
        reader.readAsText(file);
    }
}


function extractH1TagsWithData(content) {
    const h1Tags = [];
    const regex = /<h1>Date:.*?<\/h1>(.*?)<hr>/gs;
    let match;
    while ((match = regex.exec(content)) !== null) {
        h1Tags.push(match[0]);
    }

    return h1Tags;
}

function extractH1Date(content) {
    const regex = /<h1>Date:.*?<\/h1>/gs;
    let match;
    if ((match = regex.exec(content)) !== null) {
        return match[0];
    }
}

function extractRows(content) {
    const rows = [];
    const regex = /<tr[^>]*>\s*<td[^>]*>[\s\S]*?<\/td>\s*<\/tr>/gs;
    let match;
    while ((match = regex.exec(content)) !== null) {
        rows.push(match[0]);
    }
    return rows
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function extractH1PrevTagWithData(data, content) {
    const escapedSearchString = escapeRegExp(data);
    const regexPattern = new RegExp(`${escapedSearchString}(.*?)<a class="btn btn-primary" href="#top">Back</a>`, 's');
// Ищем соответствия
    const match = content.match(regexPattern);
    if (match && match[0]) {

        return match[0];
    }
    return null;
}

// Функция для удаления элементов массива из текста
function removeElementsFromArray(text, elementsToRemove) {
    for (const element of elementsToRemove) {
        text = text.replace(element, ''); // Удалить элемент из текста
    }
    return text;
}

function openFileInNewTab() {
    compareBtn.disabled = true;
    const currentH1Tags = extractH1TagsWithData(currentFileContents);
    const prevH1Tags = extractH1TagsWithData(prevFileContents);
    const equalH1 = currentH1Tags.filter((h) => prevH1Tags.includes(h));
    let preResultFileContents = removeElementsFromArray(currentFileContents, equalH1);
    const preResultH1Tags = extractH1TagsWithData(preResultFileContents);
    preResultH1Tags.forEach((tag) => {
            const preResultH1TagDate = extractH1Date(tag);
            const prevH1TagData = extractH1PrevTagWithData(preResultH1TagDate, prevFileContents);
            const currentH1TagData = extractH1PrevTagWithData(preResultH1TagDate, currentFileContents);
            if (!prevH1TagData) return;

            if (prevH1TagData.includes('Nothing found')) {
                return;
            }

            if (currentH1TagData.includes('Nothing found')) {
                return;
            }
            if (tag.includes('<tbody>')) {
                const rows = extractRows(tag);
                rows.forEach((row) => {
                    if (prevFileContents.includes(row)) {
                        preResultFileContents = preResultFileContents.replace(row, '');
                    }
                })
            }
        }
    )

    const preResultFileContentsWithEmpty = extractH1TagsWithData(preResultFileContents);

    preResultFileContentsWithEmpty.forEach(t => {
        if (t.includes('<th>') && !t.includes('<td>')
        ) {
            preResultFileContents = preResultFileContents.replace(t, '');
        }
    });


    const h1WithoutTable = extractH1TagsWithData(preResultFileContents).filter(i => !i.includes('<table'));

    h1WithoutTable.forEach(h1 => preResultFileContents = preResultFileContents.replace(h1, ''));

    const regex = /<div class="alert alert-primary"[\s\S]*?<\/div>/g;
    const regexForOl = /<ol[\s\S]*?<\/ol>/g;

    preResultFileContents = preResultFileContents.replaceAll('<div class="alert alert-danger" role="alert">Costs not found for hotel!</div>', '')
        .replaceAll('<div class="alert alert-danger" role="alert">Price links not found for hotel!<br>\n' +
            'May be hotel stoped sales.</div>', '')
        .replaceAll('<a class="btn btn-primary" href="#top">Back</a>', '')
        .replace(regex, '')
        .replace('<h3>Hotels list:</h3>', '')
        .replace(regexForOl, '');

    resultFileContents = preResultFileContents;

    if (resultFileContents) {
        const newTab = window.open();
        newTab.document.open();
        newTab.document.write(resultFileContents);
        newTab.document.close();
    }
    compareBtn.disabled = false;
}

// Добавление обработчиков событий к элементам
document.getElementById('prev-input').addEventListener('change', onPrevFileChange);
document.getElementById('current-input').addEventListener('change', onCurrentFileChange);
compareBtn.addEventListener('click', openFileInNewTab);
(() => {
gsap.registerPlugin(SplitText);

let split = new SplitText("#main", { type: "chars", charsClass: "char++" });
let chars = split.chars;
let split2 = new SplitText("#reflection", {
    type: "chars",
    charsClass: "char++"
});

// Function to make a random letter flicker
function flickerChar() {
    // Pick a random letter
    const randomChar = `.char${Math.floor(Math.random() * chars.length) + 1}`;
    console.log(randomChar);

    // Animate the chosen letter
    gsap.to(randomChar, {
        opacity: 0.1, // Random opacity between 0.3 and 0.8
        duration: 0.05, // Flicker duration
        yoyo: true, // Makes the animation play in reverse, returning the letter to full opacity
        repeat: 3,
        onComplete: function () {
            // Wait for a couple of seconds before flickering another letter
            setTimeout(flickerChar, 2000 + Math.random() * 1000);
        }
    });
}

// Start the flicker effect
    flickerChar();

    gsap.to("h1#main", {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: "power1.inOut"
    });
    gsap.to("h1#reflection", {
        y: 40,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: "power1.inOut"
    });
})()
