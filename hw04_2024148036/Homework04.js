import { resizeAspectRatio, Axes } from './util.js';
import { Shader, readShaderFile } from './shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let axes;
let startTime = 0;
let vbo_column, vbo_bigBlade, vbo_smallBlade1, vbo_smallBlade2;

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    
    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function setupBuffers() {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    // 기둥 VBO 세팅
    const columnVertices = new Float32Array([
        -0.1,  0.5,  // 좌상단
        -0.1, -0.5,  // 좌하단
         0.1, -0.5,  // 우하단
         0.1,  0.5   // 우상단
    ]);
    vbo_column = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_column);
    gl.bufferData(gl.ARRAY_BUFFER, columnVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    // 큰 날개 VBO 세팅
    const bigBladeVertices = new Float32Array([
        -0.3, 0.55,  // 좌상단
        -0.3, 0.45,  // 좌하단
         0.3, 0.45,  // 우하단
         0.3, 0.55   // 우상단
    ]);
    vbo_bigBlade = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_bigBlade);
    gl.bufferData(gl.ARRAY_BUFFER, bigBladeVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    // 왼쪽 작은 날개 VBO 세팅
    const smallBlade1Vertices = new Float32Array([
        -0.4, 0.52,  // 좌상단
        -0.4, 0.48,  // 좌하단
        -0.2, 0.48,  // 우하단
        -0.2, 0.52   // 우상단
    ]);
    vbo_smallBlade1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_smallBlade1);
    gl.bufferData(gl.ARRAY_BUFFER, smallBlade1Vertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    // 오른쪽 작은 날개 VBO 세팅
    const smallBlade2Vertices = new Float32Array([
        0.2, 0.52,  // 좌상단
        0.2, 0.48,  // 좌하단
        0.4, 0.48,  // 우하단
        0.4, 0.52   // 우상단
    ]);
    vbo_smallBlade2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_smallBlade2);
    gl.bufferData(gl.ARRAY_BUFFER, smallBlade2Vertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function render() {
    // shader의 uniform 변수 location을 불러온다.
    // 그 후, 밑의 uniform1f, uniform2fv, uniform4fv 함수를 통해
    // 값들을 shader로 보낸다.
    const bigFactorLoc  = gl.getUniformLocation(shader.program, "u_bigAngleFactor");
    const smallFactorLoc = gl.getUniformLocation(shader.program, "u_smallAngleFactor");
    const bigPivotLoc = gl.getUniformLocation(shader.program, "u_bigPivot");
    const smallPivotLoc = gl.getUniformLocation(shader.program, "u_smallPivot");
    const colorLoc = gl.getUniformLocation(shader.program, "v_color");
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    shader.use(); 
    gl.bindVertexArray(vao);
    
    // 기둥 렌더링
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_column);
    gl.vertexAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorLoc, [0.5, 0.3, 0.0, 1.0]); // 갈색
    gl.uniform1f(bigFactorLoc, 0.0); // 기둥은 회전 X.
    gl.uniform1f(smallFactorLoc, 0.0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // 큰 날개 렌더링
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_bigBlade);
    gl.vertexAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorLoc, [1.0, 1.0, 1.0, 1.0]); // 흰색
    gl.uniform1f(bigFactorLoc, 2.0); 
    gl.uniform1f(smallFactorLoc, 0.0); // 자기 회전 X.
    gl.uniform2fv(bigPivotLoc, [0.0, 0.5]);
    gl.uniform2fv(smallPivotLoc, [0.0, 0.5]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // 왼쪽 작은 날개 렌더링
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_smallBlade1);
    gl.vertexAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorLoc, [0.5, 0.5, 0.5, 1.0]); // 회색
    gl.uniform1f(bigFactorLoc, 2.0);
    gl.uniform1f(smallFactorLoc, -10.0);
    gl.uniform2fv(bigPivotLoc, [0.0, 0.5]);
    gl.uniform2fv(smallPivotLoc, [-0.3, 0.5]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // 오른쪽 작은 날개 렌더링
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_smallBlade2);
    gl.vertexAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorLoc, [0.5, 0.5, 0.5, 1.0]); // 회색
    gl.uniform1f(bigFactorLoc, 2.0);
    gl.uniform1f(smallFactorLoc, -10.0);
    gl.uniform2fv(bigPivotLoc, [0.0, 0.5]);
    gl.uniform2fv(smallPivotLoc, [0.3, 0.5]); 
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function animate(currentTime) {

    if (!startTime) startTime = currentTime; // if startTime == 0
    // t: 이전 frame에서부터의 elapsed time (in seconds)
    const t = (currentTime - startTime) / 1000; // ms -> seconds
    const timeLoc = gl.getUniformLocation(shader.program, "u_time");
    gl.uniform1f(timeLoc, t);
    render();

    requestAnimationFrame(animate);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        await initShader();
        setupBuffers();

        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
