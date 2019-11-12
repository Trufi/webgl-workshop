import * as vec3 from '@2gis/gl-matrix/vec3';
import * as mat4 from '@2gis/gl-matrix/mat4';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl', { antialias: true });

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
    uniform mat4 u_model;
    uniform mat4 u_view;

    void main(void) {
        v_color = a_color;
        gl_Position = u_view * u_model * vec4(a_position.xyz, 1.0);
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

const vertexBuffer = gl.createBuffer();
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

const viewMatrix = new Float32Array(mat4.create());
mat4.perspective(viewMatrix, (Math.PI / 180) * 45, width / height, 0.1, 100);

const objectMatrices = [];
const N = 100;
for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
        const objectMatrix = new Float32Array(mat4.create());
        mat4.translate(objectMatrix, objectMatrix, [(x - N / 2) * 5, (y - N / 2) * 5, -50]);
        objectMatrices.push(objectMatrix);
    }
}

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
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

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// Получим местоположение переменных в программе шейдеров
const locations = {
    aPosition: gl.getAttribLocation(program, 'a_position'),
    aColor: gl.getAttribLocation(program, 'a_color'),
    uModel: gl.getUniformLocation(program, 'u_model'),
    uView: gl.getUniformLocation(program, 'u_view'),
};

/**
 * РЕНДЕРИНГ
 */

function renderCube(objectMatrix: Float32Array) {
    // Укажем какую шейдерную программу мы намерены далее использовать
    gl.useProgram(program);

    mat4.rotateX(objectMatrix, objectMatrix, ((Math.PI / 180) * 10) / 15);
    mat4.rotateY(objectMatrix, objectMatrix, ((Math.PI / 180) * 10) / 15);

    gl.uniformMatrix4fv(locations.uModel, false, objectMatrix);
    gl.uniformMatrix4fv(locations.uView, false, viewMatrix);

    // Связываем данные вершин
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(locations.aPosition);
    gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(locations.aColor);
    gl.vertexAttribPointer(locations.aColor, 3, gl.FLOAT, false, 0, 0);
    // Связываем данные цветов
    // gl.uniform3f(locations.uColor, 0.96, 0.11, 0.11);

    /// Рисуем треугольник
    // Третьим аргументом передаём количество вершин геометрии
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

gl.enable(gl.CULL_FACE);

function render() {
    requestAnimationFrame(render);
    // Очищаем сцену, закрашивая её в белый цвет
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    objectMatrices.forEach(renderCube);
}

requestAnimationFrame(render);
