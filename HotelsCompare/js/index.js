let prevFileContents = null;
let currentFileContents = null;
let resultFileContents = null;

// function onFileChange(event, callback) {
//     console.log(event);
//     const fileInput = event.target;
//     const file = fileInput.files[0];
//
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function (event) {
//             callback(event.target.result);
//         };
//         reader.readAsText(file);
//     }
// }
//
// function onPrevFileChange(event) {
//     onFileChange(event, function (content) {
//         prevFileContents = content;
//     });
// }
//
// function onCurrentFileChange(event) {
//     onFileChange(event, function (content) {
//         currentFileContents = content;
//     });
// }

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
        return  match[0];
    }
}

function extractRows(content) {
    const rows = [];
    const regex = /<tr[^>]*>\s*<td[^>]*>[\s\S]*?<\/td>\s*<\/tr>/gs;
    let match;
    while ((match = regex.exec(content)) !== null) {
        rows.push(match[0]);
    }
    // console.log(content);
    // console.log(rows);

    return rows
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function extractH1PrevTagWithData(data, content) {
    // const dateRegex = /<h1>Date: (\d{2}.\d{2}.\d{4})/;
    // const hotelNameRegex = /Hotel: <a.*?>(.*?)<\/a>/;

    // const dateMatch = data.match(dateRegex);
    // const hotelNameMatch = data.match(hotelNameRegex);

    // const date = dateMatch && dateMatch[1];
    // const hotelName = hotelNameMatch && hotelNameMatch[1].replace(/\*/g, '\\*');;
    // const regexString = `<h1>Date: ${date}<br>.*?${hotelName}<\/a>.*?>Back`;
    // const regex = new RegExp(regexString, 's');
    // const match = regex.exec(content);


    const escapedSearchString = escapeRegExp(data);
// Создаем регулярное выражение
//     const regexPattern = new RegExp(`${escapedSearchString}(.*?)<a class="btn btn-primary" href="#top">Back</a>`);

    const regexPattern = new RegExp(`${escapedSearchString}(.*?)<a class="btn btn-primary" href="#top">Back</a>`, 's');
// Ищем соответствия
    const match = content.match(regexPattern);


    // console.log(date, hotelName);
    // console.log(match?.[0]);


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

// Удаляем идентичные теги <h1> из currentFileContents



// Функция для открытия содержимого файла в новой вкладке
function openFileInNewTab() {
    // some magic for compare files
    // Извлекаем теги <h1> из текущего и предыдущего файла
    const currentH1Tags = extractH1TagsWithData(currentFileContents);
    const prevH1Tags = extractH1TagsWithData(prevFileContents);
    const equalH1 = currentH1Tags.filter((h) => prevH1Tags.includes(h));
    let preResultFileContents = removeElementsFromArray(currentFileContents, equalH1);
    const preResultH1Tags = extractH1TagsWithData(preResultFileContents);
    preResultH1Tags.forEach((tag, index) => {
        const preResultH1TagDate = extractH1Date(tag);
        const prevH1TagData = extractH1PrevTagWithData(preResultH1TagDate, prevFileContents);
        const currentH1TagData = extractH1PrevTagWithData(preResultH1TagDate, currentFileContents);
        if(!prevH1TagData) return;
        // console.log(prevH1TagData);

        if(prevH1TagData.includes('Nothing found')) {
            // console.log('++++++++++Nothing found at PREV++++++++++++');
            return;
        }

        if(currentH1TagData.includes('Nothing found')) {
            // console.log('/////////////////Nothing found at CURRENT///////////////');
            return;
        }
        // console.log(prevH1TagData);
        // console.log('--------------------------------------');
        // console.log(currentH1TagData);
        if(tag.includes('<tbody>')){
         const rows = extractRows(tag);
         rows.forEach((row) => {
             if(prevFileContents.includes(row)) {
                 // console.log(row);
                 preResultFileContents = preResultFileContents.replace(row, '');
                 // console.log(preResultFileContents);
             };
         })
        }
    }
    )

    const preResultFileContentsWithEmpty = extractH1TagsWithData(preResultFileContents);

    preResultFileContentsWithEmpty.forEach(t => {
        if(t.includes('<th>') && !t.includes('<td>')
    ){
            preResultFileContents = preResultFileContents.replace(t, '');
        }});

    resultFileContents = preResultFileContents;

    if (resultFileContents) {
        const newTab = window.open();
        newTab.document.open();
        newTab.document.write(resultFileContents);
        newTab.document.close();
    }
}



// Добавление обработчиков событий к элементам
document.getElementById('prev-input').addEventListener('change', onPrevFileChange);
document.getElementById('current-input').addEventListener('change', onCurrentFileChange);
document.getElementById('openInNewTab').addEventListener('click', openFileInNewTab);
