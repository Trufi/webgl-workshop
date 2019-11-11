import * as vec3 from '@2gis/gl-matrix/vec3';
import * as mat4 from '@2gis/gl-matrix/mat4';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const gl = canvas.getContext('webgl');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

gl.viewport(0, 0, width, height);

// Создаем шейдеры
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

const vertexCode = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;

    void main(void) {
        v_color = a_color;
        gl_Position = vec4(a_position, 1.0);
    }
`;

const fragmentCode = `
    precision mediump float;
    varying vec3 v_color;

    void main(void) {
        gl_FragColor = vec4(v_color.rgb, 1.0);
    }
`;

gl.shaderSource(vertexShader, vertexCode);
gl.shaderSource(fragmentShader, fragmentCode);

gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

// Проверяем на ошибки
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
}
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragmentShader));
}

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log('Could not initialize shaders');
}

// Получим местоположение переменных в программе шейдеров
const locations = {
    aPosition: gl.getAttribLocation(program, 'a_position'),
    aColor: gl.getAttribLocation(program, 'a_color'),
};

// Создаем данные
const vertexBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();

// prettier-ignore
const vertices = [
    // Передняя грань
    -1, -1, -1,
    1, -1, -1,
    -1, -1, 1,

    1, -1, 1,
    -1, -1, 1,
    1, -1, -1,

    // Задняя грань
    -1, 1, -1,
    -1, 1, 1,
    1, 1, -1,

    1, 1, 1,
    1, 1, -1,
    -1, 1, 1,

    // Нижняя грань
    -1, -1, -1,
    -1, 1, -1,
    1, -1, -1,

    1, 1, -1,
    1, -1, -1,
    -1, 1, -1,

    // Верхняя грань
    -1, -1, 1,
    1, -1, 1,
    -1, 1, 1,

    1, 1, 1,
    -1, 1, 1,
    1, -1, 1,

    // Левая грань
    -1, -1, -1,
    -1, -1, 1,
    -1, 1, -1,

    -1, 1, 1,
    -1, 1, -1,
    -1, -1, 1,

    // Правая грань
    1, -1, -1,
    1, 1, -1,
    1, -1, 1,

    1, 1, 1,
    1, -1, 1,
    1, 1, -1
];

// prettier-ignore
const colors = [
    // Передняя грань
    1, 0.5, 0.5,
    1, 0.5, 0.5,
    1, 0.5, 0.5,
    1, 0.5, 0.5,
    1, 0.5, 0.5,
    1, 0.5, 0.5,

    // Задняя грань
    1, 0.5, 0.5,
    1, 0.5, 0.5,
    1, 0.5, 0.5,
    1, 0.5, 0.5,
    1, 0.5, 0.5,
    1, 0.5, 0.5,

    // Нижняя грань
    0.5, 0.7, 1,
    0.5, 0.7, 1,
    0.5, 0.7, 1,
    0.5, 0.7, 1,
    0.5, 0.7, 1,
    0.5, 0.7, 1,

    // Верхняя грань
    0.5, 0.7, 1,
    0.5, 0.7, 1,
    0.5, 0.7, 1,
    0.5, 0.7, 1,
    0.5, 0.7, 1,
    0.5, 0.7, 1,

    // Левая грань
    0.3, 1, 0.3,
    0.3, 1, 0.3,
    0.3, 1, 0.3,
    0.3, 1, 0.3,
    0.3, 1, 0.3,
    0.3, 1, 0.3,

    // right face
    0.3, 1, 0.3,
    0.3, 1, 0.3,
    0.3, 1, 0.3,
    0.3, 1, 0.3,
    0.3, 1, 0.3,
    0.3, 1, 0.3
];

const objectMatrix = mat4.create();
mat4.scale(objectMatrix, objectMatrix, [0.5, 0.5, 0.5, 0.5]);

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

/**
 * РЕНДЕРИНГ
 */

let lastTime = Date.now();

function renderLoop() {
    requestAnimationFrame(renderLoop);
    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;

    mat4.rotateX(objectMatrix, objectMatrix, (Math.PI / 180) * delta * 0.02);
    mat4.rotateY(objectMatrix, objectMatrix, (Math.PI / 180) * delta * 0.02);

    const currentVertices = [];
    for (let i = 0; i < vertices.length; i += 3) {
        const vector = [vertices[i], vertices[i + 1], vertices[i + 2]];

        vec3.transformMat4(vector, vector, objectMatrix);

        currentVertices[i] = vector[0];
        currentVertices[i + 1] = vector[1];
        currentVertices[i + 2] = vector[2];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(currentVertices), gl.STATIC_DRAW);

    // Укажем какую шейдерную программу мы намерены далее использовать
    gl.useProgram(program);

    // Связываем данные цветов
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(locations.aColor);
    // Вторым аргументом передаём размерность, RGB имеет 3 компоненты
    gl.vertexAttribPointer(locations.aColor, 3, gl.FLOAT, false, 0, 0);

    // И вершин
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(locations.aPosition);
    gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.enable(gl.CULL_FACE);

    // Очищаем сцену, закрашивая её в белый цвет
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Рисуем треугольник
    // Третьим аргументом передаём количество вершин геометрии
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}
requestAnimationFrame(renderLoop);

export {};
