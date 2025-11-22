'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

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
            positions[i + 2] = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.5
        }

        geometry.attributes.position.needsUpdate = true
        geometry.computeVertexNormals()
    })

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, -10, -20]}>
            <planeGeometry args={[40, 40, 50, 50]} />
            <meshStandardMaterial
                color="#c9a961"
                wireframe
                transparent
                opacity={0.12}
            />
        </mesh>
    )
}

function BrandText() {
    const textRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!textRef.current) return
        const time = state.clock.getElapsedTime()
        // Subtle floating animation
        textRef.current.position.y = Math.sin(time * 0.3) * 0.3 - 8
    })

    return (
        <Text
            ref={textRef}
            position={[0, -8, -15]}
            fontSize={1.2}
            color="#c9a961"
            anchorX="center"
            anchorY="middle"
        >
            PRIME LUX EVENTS
            <meshStandardMaterial
                color="#c9a961"
                transparent
                opacity={0.15}
                emissive="#c9a961"
                emissiveIntensity={0.2}
            />
        </Text>
    )
}

export function ThreeBackground() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 15], fov: 75 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <WaveGrid />
                <BrandText />
            </Canvas>
        </div>
    )
}
