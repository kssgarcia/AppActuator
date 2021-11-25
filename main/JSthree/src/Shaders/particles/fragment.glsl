varying vec3 v_worldNormal;
varying vec3 colorLightB;
varying vec3 colorLightA;
varying float vColor;

void main()
{

  //gl_FragColor = vec4(vec3(vColor), 1.0);
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  gl_FragColor.xyz = colorLightA * 0.5;
  //gl_FragColor.xyz = colorLightB * 0.5;
}



