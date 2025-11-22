'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function WaveGrid() {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!meshRef.current) return

        const time = state.clock.getElapsedTime()
        const geometry = meshRef.current.geometry as THREE.PlaneGeometry
        const positions = geometry.attributes.position.array as Float32Array

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i]
            const y = positions[i + 1]

            // Complex wave function for "flowing silk" effect
            const wave1 = Math.sin(x * 0.2 + time * 0.5) * Math.cos(y * 0.2 + time * 0.5) * 2
            const wave2 = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.5
            const wave3 = Math.sin(Math.sqrt(x * x + y * y) * 0.2 - time * 0.8) * 1.5

            positions[i + 2] = wave1 + wave2 + wave3
        }

        geometry.attributes.position.needsUpdate = true
        geometry.computeVertexNormals()
    })

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -5, -20]}>
            <planeGeometry args={[60, 40, 75, 50]} />
            <meshStandardMaterial
                color="#c9a961"
                wireframe
                transparent
                opacity={0.15}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

export function ThreeBackground() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas
                camera={{ position: [0, 5, 15], fov: 60 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <WaveGrid />
            </Canvas>
        </div>
    )
}
