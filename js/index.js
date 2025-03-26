import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.18.2/+esm"

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
    const header = document.querySelector('.header');
    header.classList.add('strobe');
    setTimeout(() => {header.classList.remove('strobe')}, 4000);
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




const buttonWrapperEl = document.querySelector(".btn");
const buttonClickerEl = document.querySelector(".btn button");
const canvasEl = document.querySelector(".btn canvas");
const devicePixelRatio = Math.min(window.devicePixelRatio, 2);

// buttonWrapperEl.addEventListener('mouseenter', function(event) {
//     var mouseX = event.pageX;
//     var mouseY = event.pageY;
//
//     buttonWrapperEl.style.top = mouseY + 'px';
//     buttonWrapperEl.style.left = mouseX + 'px';
// });



function getRandomX() {
    return Math.floor(Math.random() * (window.innerWidth - buttonWrapperEl.offsetWidth));
}

buttonWrapperEl.addEventListener('mouseenter', function() {
    // Перемещение элемента в рандомное место по оси X вне зоны наведения
    buttonWrapperEl.style.left = getRandomX() + 'px';
});

buttonWrapperEl.addEventListener('mouseleave', function() {
    // Перемещение элемента в рандомное место по оси X вне зоны наведения
    buttonWrapperEl.style.left = getRandomX() + 'px';
});
const params = {
    clickTime: 0,
    clickDuration: .7,
    wasClicked: false,
    width: .2,
    ratio: 2,
    speed: 5,
    size: .65,
    color: [0.2392, 0.8392, 0.3608],
    midColor: [1.0, 0.9176, 0.0196]
};

let startTime = null;

let uniforms;
const gl = initShader();
createControls();

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
render();




function initShader() {
    const vsSource = document.getElementById("vertShader").innerHTML;
    const fsSource = document.getElementById("fragShader").innerHTML;

    const gl = canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl");

    if (!gl) {
        alert("WebGL is not supported by your browser.");
    }

    function createShader(gl, sourceCode, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

    function createShaderProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    uniforms = getUniforms(shaderProgram);

    function getUniforms(program) {
        let uniforms = [];
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(shaderProgram);

    const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(uniforms.u_ratio, params.ratio);
    gl.uniform1f(uniforms.u_extra_width, params.width);
    gl.uniform1f(uniforms.u_speed, params.speed);
    gl.uniform1f(uniforms.u_size, params.size);
    gl.uniform3f(uniforms.u_color, params.color[0], params.color[1], params.color[2]);
    gl.uniform3f(uniforms.u_mid_color, params.midColor[0], params.midColor[1], params.midColor[2]);

    return gl;
}

function render() {
    const currentTime = performance.now();
    gl.uniform1f(uniforms.u_time, currentTime);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (params.clickTime >= params.clickDuration) {
        params.clickTime = 0;
        params.wasClicked = false;
    } else if (params.wasClicked) {
        params.clickTime = (currentTime - startTime) / 1000;
    }
    gl.uniform1f(uniforms.u_click_time, params.clickTime / params.clickDuration);
    requestAnimationFrame(render);
}

function resizeCanvas() {
    canvasEl.width = buttonWrapperEl.clientHeight * params.ratio * devicePixelRatio;
    canvasEl.height = buttonWrapperEl.clientHeight * devicePixelRatio;
    gl.viewport(0, 0, canvasEl.width, canvasEl.height);
}

function createControls() {
    const gui = new GUI();
    gui.close();
    gui.addColor(params, "color")
        .onChange(v => {
            gl.uniform3f(uniforms.u_color, v[0], v[1], v[2]);
            console.log(v[0], v[1], v[2])
        })
        .name("main color")
    gui.addColor(params, "midColor")
        .onChange(v => {
            gl.uniform3f(uniforms.u_mid_color, v[0], v[1], v[2]);
            console.log(v[0], v[1], v[2])
        })
        .name("dot color")
    gui.add(params, "speed", 1, 10)
        .onChange(v => {
            gl.uniform1f(uniforms.u_speed, v);
        })
        .name("floating speed")
    gui.add(params, "clickDuration", .3, 1.5)
        .name("splash duration")
    gui.add(params, "width", 0, .35)
        .onChange(v => {
            gl.uniform1f(uniforms.u_extra_width, v);
        })
        .name("extra width")
    gui.add(params, "size", .6, .9)
        .onChange(v => {
            gl.uniform1f(uniforms.u_size, v);
        })
        .name("dot size")
}
