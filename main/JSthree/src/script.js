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
import vertexShaderParticles from './Shaders/particles/vertex.glsl'
import fragmentShaderParticles from './Shaders/particles/fragment.glsl'
import fragmentShaderPlane from './Shaders/Plane/Fragment.glsl'
import vertexShaderPlane from './Shaders/Plane/Vertex.glsl'
import FlowField from './FlowField.js'
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
    this.setFlowfield();
    this.Particles();
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

  setFlowfield()
  {
    this.flowField = new FlowField({ positions: this.positions, debugFolder: this.debugFolder }, renderer, clock, scene)
  }

  Particles()
  {
    // Set geometry
    const size = new Float32Array(this.count)
    const uv = new Float32Array(this.count * 2)

    for(let i = 0; i < this.count; i++)
    {
      size[i] = 0.2 + Math.random() * 0.8
    }

    for(let j = 0; j < this.height; j++)
    {
      for(let i = 0; i < this.width; i++)
      {
        uv[(j * this.width * 2) + (i * 2) + 0] = i / this.width
        uv[(j * this.width * 2) + (i * 2) + 1] = j / this.height
      }
    }

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    this.geometry.setAttribute('aFboUv', this.flowField.fboUv.attribute)
    this.geometry.setAttribute('aUv', new THREE.BufferAttribute(uv, 2))

    // Material
    this.material = new THREE.ShaderMaterial({
      uniforms:
      {
        uSize: { value: 50 * 1 },
        uFBOTexture: { value: this.flowField.texture },
        uTime: { uTime: 0 }
      },
      vertexShader: vertexShaderParticles,
      fragmentShader: fragmentShaderParticles
    })

    this.points = new THREE.Points(this.geometry, this.material)
    scene.add(this.points)
  }

  PlaneWave()
  {
    this.geometry = new THREE.PlaneGeometry(90, 50, 200, 200);
    this.material = new THREE.MeshBasicMaterial({color: 0xffffff});
 
    // Material
    this.planeMaterial = new THREE.ShaderMaterial({
      uniforms:
      {
        uTime: { uTime: 0 }
      },
      vertexShader: vertexShaderPlane,
      fragmentShader: fragmentShaderPlane
    })

    this.plane = new THREE.Mesh(this.geometry, this.planeMaterial);
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
    camera.position.set(0, 0, 12);
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

    // Flowfield update
    this.flowField.update()
    this.points.material.uniforms.uFBOTexture.value = this.flowField.texture
    this.points.material.uniforms.uTime.value = elapsedTime;

    // Plane update 
    this.plane.material.uniforms.uTime.value = elapsedTime;

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
    if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
      RenderTargetClass = THREE.WebGLMultisampleRenderTarget
    }
    else {
      RenderTargetClass = THREE.WebGLRenderTarget
      console.log('Using WebGLRenderTarget')
    }

    const renderTarget = new RenderTargetClass(
      800,
      600,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
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
    effectcomposer.addPass( bloomPass );
    //effectcomposer.addPass( rgbShader );
    //effectcomposer.addPass(this.finalPass);
    //effectcomposer.addPass( grainShader );
  }
}

new HeroThree();
