'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function AnimatedParticles() {
    const pointsRef = useRef<THREE.Points>(null)
    const mouseRef = useRef({ x: 0, y: 0 })

    // Create particle positions
    const particleCount = 1000
    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3)
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 50
            pos[i * 3 + 1] = (Math.random() - 0.5) * 50
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50
        }
        return pos
    }, [])

    // Mouse move handler
    useMemo(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Animation loop
    useFrame((state) => {
        if (!pointsRef.current) return

        const time = state.clock.getElapsedTime()

        // Rotate the entire particle system slowly
        pointsRef.current.rotation.y = time * 0.05
        pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1

        // Subtle mouse interaction
        pointsRef.current.rotation.y += mouseRef.current.x * 0.01
        pointsRef.current.rotation.x += mouseRef.current.y * 0.01

        // Animate individual particles
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3
            positions[i3 + 1] += Math.sin(time + i * 0.1) * 0.002
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#d4af37"
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

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
                color="#1a1a2e"
                wireframe
                transparent
                opacity={0.15}
            />
        </mesh>
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
                <AnimatedParticles />
                <WaveGrid />
            </Canvas>
        </div>
    )
}
