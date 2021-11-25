import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
// Shader
import rgbShadervertex from './Shaders/rgb/vertex.glsl';
import rgbShaderFragment from './Shaders/rgb/fragment.glsl';
import finalPassShaderVertex from './Shaders/FinalPass/vertex.glsl';
import finalPassShaderFragment from './Shaders/FinalPass/fragment.glsl';
import grainShaderVertex from './Shaders/Grain/vertex.glsl';
import grainShaderFragment from './Shaders/Grain/fragment.glsl'
import vertexShaderSphere from './Shaders/particles/vertex.glsl'
import fragmentShaderSphere from './Shaders/particles/fragment.glsl'
import fragmentShaderPlane from './Shaders/Plane/Fragment.glsl'
import vertexShaderPlane from './Shaders/Plane/Vertex.glsl'
import Time from './Utils/Time.js'

// New effect composer 


let isAndroid = false;
if( /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  isAndroid = true;
}

let loadingManager;
let canvas, scene, camera, controls;
let clock;
let renderer, effectcomposer, rgbShader, grainShader;
let plane;

class HeroThree {
  constructor() 
  {
    canvas = document.querySelector('canvas.webgl');
    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    this.OnLoad();

    this.width = 1000;
    this.height = 427;
    this.ratio = this.width / this.height;
    this.count = this.width * this.height;
    clock = new Time();

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('draco/');
    this.gltfLoader = new GLTFLoader(loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);


    //Objects
    this.setPositions();
    this.Resize();
    this.Settings();
    this.sphereWave();
    this.PlaneWave();
    this.PostProcessing();
    this.Tick();
  }

  OnLoad() {
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );
    loadingManager = new THREE.LoadingManager( () => {
      const loadingScreen = document.getElementById( 'loading-screen' );
      loadingScreen.classList.add( 'fade-out' );
    } );
  }

  setPositions()
  {
    // Set Positions
    this.positions = new Float32Array(this.count * 3);

    for(let i = 0; i < this.count; i++)
    {
      this.positions[i] = (Math.random() - 0.5) * 10
    }
  }

  sphereWave()
  {
 
   // Material
    this.materialWaveS = new THREE.ShaderMaterial({
      uniforms:
      {
        uTime: { value: 0 },
        uLightA: { value: new THREE.Vector3(14, 0, 10) },
        uLightB: { value: new THREE.Vector3(-14, 0, -10) }
      },
      vertexShader: vertexShaderSphere,
      fragmentShader: fragmentShaderSphere
    })

    // Sphere
    this.sphereGeometry = new THREE.SphereGeometry(30, 550, 550)
    this.sphere = new THREE.Mesh(this.sphereGeometry, this.materialWaveS)
    this.sphere.position.set(0, 50, 0)
    scene.add(this.sphere)
  }

 
  PlaneWave()
  {
    this.geometry = new THREE.PlaneGeometry(90, 50, 500, 500);
 
    // Material
    this.materialWave = new THREE.ShaderMaterial({
      uniforms:
      {
        uTime: { value: 0 },
        uLight: { value: new THREE.Vector3(0, 100, 200) },
        uSubdivision: { value: new THREE.Vector2(500, 500) },
      },
      defines:
      {
        USE_TANGENT: ''
      },
      vertexShader: vertexShaderPlane,
      fragmentShader: fragmentShaderPlane
    })

    this.plane = new THREE.Mesh(this.geometry, this.materialWave);
    scene.add(this.plane);
  }

   Resize() 
  {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    window.addEventListener('resize', () => {
      // Update sizes
      this.sizes.width = window.innerWidth
      this.sizes.height = window.innerHeight

      // Update camera
      camera.aspect = this.sizes.width / this.sizes.height
      camera.updateProjectionMatrix()

      // Update renderer
      renderer.setSize(this.sizes.width, this.sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // Update Composer
      effectcomposer.setSize(this.sizes.width, this.sizes.height);
    })
  }

  Settings() 
  {
    camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100);     
    camera.position.set(0, 0, 70);
    // Controls
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    })
    renderer.setSize(this.sizes.width, this.sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  Tick() 
  {
    // Elapsed time
    const elapsedTime = clock.elapsed;

    // Material update 
    this.plane.material.uniforms.uTime.value = elapsedTime;
    this.sphere.material.uniforms.uTime.value = elapsedTime;

    // Controls update
    controls.update();

    // Update Post-processing
    effectcomposer.render(); 
    rgbShader.material.uniforms.uTime.value = elapsedTime;
    grainShader.material.uniforms.amount.value += 0.01;

    // Call Tick again on the next frame
    window.requestAnimationFrame(this.Tick.bind(this));
  }

  PostProcessing() 
  {
    let RenderTargetClass = null

    RenderTargetClass = renderer.getPixelRatio() >= 2 ? THREE.WebGLRenderTarget : THREE.WebGLMultisampleRenderTarget
    
    const renderTarget = new RenderTargetClass(
      window.innerWidth,
      window.innerHeight,
      {
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        encoding: THREE.sRGBEncoding
      }
    )

    const renderScene = new RenderPass( scene, camera )

    // Bloom Post processing
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.8, 0.315, 0 );
        bloomPass.enabled = true

        bloomPass.tintColor = {}
        bloomPass.tintColor.value = '#7f00ff'
        bloomPass.tintColor.instance = new THREE.Color(bloomPass.tintColor.value)
        
        bloomPass.compositeMaterial.uniforms.uTintColor = { value: bloomPass.tintColor.instance }
        bloomPass.compositeMaterial.uniforms.uTintStrength = { value: 0.15 }
        bloomPass.compositeMaterial.fragmentShader = `
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform sampler2D dirtTexture;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
uniform vec3 uTintColor;
uniform float uTintStrength;
float lerpBloomFactor(const in float factor) {
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, bloomRadius);
}
void main() {
    vec4 color = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
        lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
        lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
        lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
        lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
    color.rgb = mix(color.rgb, uTintColor, uTintStrength);
    gl_FragColor = color;
}
        `
    // RGB Post processing
    this.rgbShift = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: null },
        uTransition: { value: 0 }
      },
      vertexShader: rgbShadervertex,
      fragmentShader: rgbShaderFragment
    }
    rgbShader = new ShaderPass(this.rgbShift);
    rgbShader.material.uniforms.uTime.value = 0

    // Final post processing 
    this.finalPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uNoiseMultiplier: { value: 0.03 },
        uNoiseOffset: { value: -0.1 },
        uRGBShiftMultiplier: { value: 0.004 },
        uRGBShiftOffset: { value: 0.04 },
      },
      vertexShader: finalPassShaderVertex,
      fragmentShader: finalPassShaderFragment
    })

    // Grain Post processing
    this.grainEffect = {
      uniforms: {
        tDiffuse: { value: null },
        amount: { value: null }
      },
      vertexShader: grainShaderVertex,
      fragmentShader: grainShaderFragment
    }
    grainShader = new ShaderPass(this.grainEffect)
    grainShader.material.uniforms.amount.value = 0

    // EffectComposer
    effectcomposer = new EffectComposer( renderer, renderTarget );
    effectcomposer.setSize(this.sizes.width, this.sizes.height)
    effectcomposer.addPass( renderScene );
    //effectcomposer.addPass( bloomPass );
    //effectcomposer.addPass( rgbShader );
    //effectcomposer.addPass(this.finalPass);
    //effectcomposer.addPass( grainShader );
  }
}

new HeroThree();
