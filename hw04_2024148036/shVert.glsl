#version 300 es

in vec2 a_position;
uniform float u_time; // 경과 시간
uniform float u_bigAngleFactor; // 큰 날개의 회전 계수(0 또는 2)
uniform float u_smallAngleFactor; // 작은 날개의 회전 계수(0 또는 -10)
uniform vec2  u_bigPivot; // 큰 날개의 중심 (0.0, 0.5)     
uniform vec2  u_smallPivot; // 작은 날개의 중심 (+-0.3, 0.5)

void main() {
    // bigAngle: 큰 흰색 날개의 회전각(2π sin(t))
    // smallAngle: 작은 회색 날개의 회전각(-10π sin(t))
    float bigAngle = u_bigAngleFactor * 3.1415926535 * sin(u_time);
    float smallAngle = u_smallAngleFactor * 3.1415926535 * sin(u_time);

    // 회전 중심 기준 변환
    // 우선 작은 날개 자체를 원점으로 옮기고 자체 회전시킨다(-10π sin(t)).
    // 만약 큰 날개라면 회전하지 않는다.
    vec2 pos = a_position - u_smallPivot;
    pos = vec2(cos(smallAngle) * pos.x - sin(smallAngle) * pos.y, 
                sin(smallAngle) * pos.x + cos(smallAngle) * pos.y);
    pos += u_smallPivot;

    // 그 다음, 작은 날개를 큰 날개의 붙인 위치로 옮기고,
    // 큰 날개의 회전에 따라 움직이게 한다(2π sin(t)).
    // 만약 기둥이라면 회전하지 않는다.
    pos -= u_bigPivot;
    pos = vec2(cos(bigAngle) * pos.x - sin(bigAngle) * pos.y, 
                sin(bigAngle) * pos.x + cos(bigAngle) * pos.y);
    pos += u_bigPivot;

    // 최종 위치값
    gl_Position = vec4(pos, 0.0, 1.0);
} 