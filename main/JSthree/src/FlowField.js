import * as THREE from 'three'

import vertexShaderFlow from './Shaders/flowField/vertex.glsl'
import fragmentShaderFlow from './Shaders/flowField/fragment.glsl'

export default class FlowField
{
    constructor(_options, renderer, time, scene)
    {
        this.renderer = renderer
        this.time = time
        this.scene = scene

        this.positions = _options.positions
        this.debug = _options.debugFolder
        
        this.count = this.positions.length / 3
        this.width = 640
        this.height = 427
        this.texture = null
        this.seed = Math.random() * 1000

        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'flowField'
            })
        }

        this.setBaseTexture()
        this.setRenderTargets()
        this.setEnvironment()
        this.setPlane()
        this.setDebugPlane()
        this.setFboUv()

        this.render()
    }

    setBaseTexture()
    {
        const size = this.width * this.height
        const data = new Float32Array(size * 4)

        for(let i = 0; i < size; i++)
        {
            data[i * 4 + 0] = this.positions[i * 3 + 0]
            data[i * 4 + 1] = this.positions[i * 3 + 1]
            data[i * 4 + 2] = this.positions[i * 3 + 2]
            data[i * 4 + 3] = Math.random()
        }

        this.baseTexture = new THREE.DataTexture(
            data,
            this.width,
            this.height,
            THREE.RGBAFormat,
            THREE.FloatType
        )
        this.baseTexture.minFilter = THREE.NearestFilter
        this.baseTexture.magFilter = THREE.NearestFilter
        this.baseTexture.generateMipmaps = false
    }

    setRenderTargets()
    {
        this.renderTargets = {}
        this.renderTargets.a = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                generateMipmaps: false,
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
                encoding: THREE.LinearEncoding,
                depthBuffer: false,
                stencilBuffer: false
            }
        )
        this.renderTargets.b = this.renderTargets.a.clone()
        this.renderTargets.primary = this.renderTargets.a
        this.renderTargets.secondary = this.renderTargets.b
    }

    setEnvironment()
    {
        this.environment = {}

        this.environment.scene = new THREE.Scene()
        this.environment.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
        this.environment.camera.position.z = 1
    }

    setPlane()
    {
        this.plane = {}

        // Geometry
        this.plane.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)

        // Material
        this.plane.material = new THREE.ShaderMaterial({
            // precision: 'highp',
            uniforms:
            {
                uTime: { value: 0 },
                uDelta: { value: 16 },

                uBaseTexture: { value: this.baseTexture },
                uTexture: { value: this.baseTexture },

                uDecaySpeed: { value: 0.00049 },

                uPerlinFrequency: { value: 0.3 },
                uPerlinMultiplier: { value: 0.1 },
                uTimeFrequency: { value: 0.001 },
                uSeed: { value: this.seed }
            },
            vertexShader: vertexShaderFlow,
            fragmentShader: fragmentShaderFlow
        })

        // Mesh
        this.plane.mesh = new THREE.Mesh(this.plane.geometry, this.plane.material)
        this.environment.scene.add(this.plane.mesh)
        
    }

    setDebugPlane()
    {
        this.debugPlane = {}

        // Geometry
        this.debugPlane.geometry = new THREE.PlaneGeometry(1, this.height / this.width, 1, 1)

        // Material
        this.debugPlane.material = new THREE.MeshBasicMaterial({ transparent: true })

        // Mesh
        this.debugPlane.mesh = new THREE.Mesh(this.debugPlane.geometry, this.debugPlane.material)
        this.debugPlane.mesh.visible = false
        this.scene.add(this.debugPlane.mesh)
        
    }

    setFboUv()
    {
        this.fboUv = {}

        this.fboUv.data = new Float32Array(this.count * 2)

        const halfExtentX = 1 / this.width / 2
        const halfExtentY = 1 / this.height / 2

        for(let i = 0; i < this.count; i++)
        {
            const x = (i % this.width) / this.width + halfExtentX
            const y = Math.floor(i / this.width) / this.height + halfExtentY

            this.fboUv.data[i * 2 + 0] = x
            this.fboUv.data[i * 2 + 1] = y
        }

        this.fboUv.attribute = new THREE.BufferAttribute(this.fboUv.data, 2)
    }

    render()
    {
        // Render
        this.renderer.setRenderTarget(this.renderTargets.primary)
        this.renderer.render(this.environment.scene, this.environment.camera)
        this.renderer.setRenderTarget(null)

        // Swap
        const temp = this.renderTargets.primary
        this.renderTargets.primary = this.renderTargets.secondary
        this.renderTargets.secondary = temp
        
        // Update texture
        this.texture = this.renderTargets.secondary.texture
        
        // Update debug plane
        this.debugPlane.material.map = this.texture
    }

    update()
    {
        // Update material
        this.plane.material.uniforms.uDelta.value = this.time.delta
        this.plane.material.uniforms.uTime.value = this.time.elapsed
        this.plane.material.uniforms.uTexture.value = this.renderTargets.secondary.texture
        this.render()
    }

    dispose()
    {
        this.baseTexture.dispose()
        this.renderTargets.a.dispose()
        this.renderTargets.b.dispose()
        this.plane.geometry.dispose()
        this.plane.material.dispose()

        this.debugPlane.geometry.dispose()
        this.scene.remove(this.debugPlane.mesh)

        if(this.debug)
        {
            this.debugFolder.dispose()
        }
    }
}
