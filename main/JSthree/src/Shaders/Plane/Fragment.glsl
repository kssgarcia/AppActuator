varying float vHeight;
varying vec3 vlightColor;
varying vec3 v_worldNormal;

void main()
{
  vec3 mixColor = mix(vec3(0.0), vec3(1.0, 0.0, 0.0), vHeight);
  //gl_FragColor = vec4(vColor, vColor, vColor, 1.0);
  gl_FragColor = vec4(mixColor, 1.0);
}



