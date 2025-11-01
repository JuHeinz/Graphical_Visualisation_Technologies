attribute vec3 pos;
attribute vec4 col;
varying vec4 color;
void main() {
    color = col;
    gl_Position = vec4(pos, 1.0);
}