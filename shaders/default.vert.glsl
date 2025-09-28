attribute vec2 a_position;
uniform vec2 u_resolution;
uniform float u_pointSize;

void main(){
  vec2 zeroToOne = a_position / u_resolution;
  vec2 clipSpace = zeroToOne * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
  gl_PointSize = u_pointSize;
}
