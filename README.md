# НЕ воркшоп по WebGL

## План

1. Рисуем треугольник, задаем только вершины
2. Меняем цвет из JS с помощью юниформы
3. Передаем цвет через атрибуты
4. Добавляем 3-ю размерность
5. Рисуем куб увеличивая количество треугольников до 12
    - Скейлим куб через `.map(x => x * 0.5)`
    - Добавляем `gl-matrix`, скейлим через матрицу
6. Добавляем вращение на 45 градусов
    - Добавляем `gl.enable(gl.CULL_FACE);`
7. Добавляем анимацию
8. Переносим умножение на матрицу из JS в шейдеры
9. Добавляем перспективу в существующую матрицу
10. Расширяем пример для отрисовки большего количества кубов
    - Разбиваем матрицу на 2: матрица камеры и матрица объекта
    - Добавляем массив матриц для каждого объекта
    - Отрисовку 1-го кубика выносим в отдельную функцию `renderObject`

В папке `src` содержатся исходники для каждого пункта.

## Сниппеты

### Инициализация

-   `wstyle` — добавление стилей для канваса
-   `wcanvas` — получение канваса в JS
-   `wsize` — задание width и height
-   `wcanvassize` — задание размеров канвасу
-   `wcreateshader` — создание шейдеров
-   `wvertcode` — код вершинного шейдера
-   `wfragcode` — код фрагментного шейдера
-   `wshadersource` – подключение кода к шейдерам
-   `wshadercompile` — компиляция шейдеров
-   `wprogram` — создание шейдерной программы
-   `wlocations` — метосположение переменных в программе
-   `wbuffervertexstart` — создание буфера вершин из пустого массива
-   `wbuffervertex` — создание буфера вершин

### Рендеринг

-   `wuseprogram` — использование программы
-   `wbindvertex` — связывание данных вершин
-   `wclear` — очистка экрана
-   `wrendertriangle` — вызов drawArrays

### Улучшалки

-   `wbinduniform` — связанывание цвета через юниформу
-   `wbuffercolor` — создание буфера цветов
-   `wcubevertices` — массив вершин для куба
-   `wcubecolors` — массив цветов для куба
-   `wimportmatrix` — импорт `gl-matrix`
-   `wrotatevector` — поворот вершин с помощью матрицы в JS
