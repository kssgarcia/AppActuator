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
import pointShadervertex from './Shaders/Points/pointVertex.glsl';
import pointShaderFragment from './Shaders/Points/pointFragment.glsl';
import Time from './Utils/Time.js'
import { Pane } from 'tweakpane'

// New effect composer 

let isAndroid = false;
if( /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  isAndroid = true;
}

const textureLoader = new THREE.TextureLoader();
const noiseTexture = textureLoader.load('./texture.jpg');

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

    // Config debug
    this.setDebug();
    this.debugFolder = this.debug.addFolder({
      title: 'wave',
      expanded: true
    })

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('draco/');
    this.gltfLoader = new GLTFLoader(loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    //Objects
    this.Material();
    this.Geometry();
    this.addDebug();
    this.Resize();
    this.Settings();
    this.PostProcessing();
    this.Tick();
  }

  setDebug()
  {
    this.debug = new Pane()
    this.debug.containerElem_.style.width = '320px'
    this.debug.containerElem_.style.zIndex = 850 
  }

  OnLoad() {
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );
    loadingManager = new THREE.LoadingManager( () => {
      const loadingScreen = document.getElementById( 'loading-screen' );
      loadingScreen.classList.add( 'fade-out' );
    } );
  }

  Material() 
  {
    this.material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value:0 },
            uColor1: { value: new THREE.Color('black') },
            uColor2: { value: new THREE.Color('#757575') },
            uTouch: { value: null },
            uTexture: { value: noiseTexture },
            uProgress: {value: 1.6},
            uScroll: { value: 0 },
            uFactor: { value: 1000 }
        },
        vertexShader: pointShadervertex,
        fragmentShader: pointShaderFragment
    })

    // touch = new TouchTexture();
    // pointMaterial.uniforms.uTouch.value = touch.texture;
}

  Geometry()
  {
    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(10.3, 5.7), this.material);
    scene.add(this.plane)
  }

  addDebug()
  {
    this.debugFolder.addInput(
      this.material.uniforms.uProgress,
      'value',
      { label: 'uProgress', min: 0, max: 10, step: 0.001 }
    )
    this.debugFolder.addInput(
      this.material.uniforms.uScroll,
      'value',
      { label: 'uScroll', min: 0, max: 10, step: 0.001 }
    )

    this.debugFolder.addInput(
      this.material.uniforms.uFactor,
      'value',
      { label: 'uFactor', min: 0, max: 2000, step: 1 }
    )
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
    camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 15);     
    camera.position.set(0, 0, 3);

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
        bloomPass.compositeMaterial.uniforms.uTintStrength = { value: 0.0  }
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
    effectcomposer.addPass( bloomPass );
    effectcomposer.addPass( rgbShader );
    //effectcomposer.addPass(this.finalPass);
    effectcomposer.addPass( grainShader );
  }
}

new HeroThree();
