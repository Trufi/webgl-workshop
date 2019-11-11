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
    attribute vec2 a_position;

    void main(void) {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const fragmentCode = `
    precision mediump float;

    uniform vec3 u_color;

    void main(void) {
        gl_FragColor = vec4(u_color.rgb, 1.0);
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
    uColor: gl.getUniformLocation(program, 'u_color'),
};

// Создаем данные
const vertexBuffer = gl.createBuffer();

// prettier-ignore
const vertices = [
    -1,  1,
     1,  1,
     0, -1,
];

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

/**
 * РЕНДЕРИНГ
 */

// Укажем какую шейдерную программу мы намерены далее использовать
gl.useProgram(program);

// Связываем данные цветов
gl.uniform3f(locations.uColor, 0.46, 0.11, 0.18);

// И вершин
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.enableVertexAttribArray(locations.aPosition);
gl.vertexAttribPointer(locations.aPosition, 2, gl.FLOAT, false, 0, 0);

// Очищаем сцену, закрашивая её в белый цвет
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Рисуем треугольник
// Третьим аргументом передаём количество вершин геометрии
gl.drawArrays(gl.TRIANGLES, 0, 3);

export {};
