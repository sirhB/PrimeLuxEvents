'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

interface FloatingObjectProps {
    position: [number, number, number]
    color: string
    geometry: 'sphere' | 'torus' | 'box'
    speed?: number
}

function FloatingObject({ position, color, geometry, speed = 1 }: FloatingObjectProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!meshRef.current) return

        const time = state.clock.getElapsedTime() * speed
        meshRef.current.position.y = position[1] + Math.sin(time) * 0.5
        meshRef.current.rotation.x += 0.01 * speed
        meshRef.current.rotation.y += 0.01 * speed
    })

    return (
        <mesh ref={meshRef} position={position}>
            {geometry === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
            {geometry === 'torus' && <torusGeometry args={[0.4, 0.15, 16, 32]} />}
            {geometry === 'box' && <boxGeometry args={[0.6, 0.6, 0.6]} />}
            <meshStandardMaterial
                color={color}
                transparent
                opacity={0.3}
                metalness={0.8}
                roughness={0.2}
            />
        </mesh>
    )
}

interface FloatingObjectsProps {
    objects?: Array<{
        position: [number, number, number]
        color: string
        geometry: 'sphere' | 'torus' | 'box'
        speed?: number
    }>
}

const defaultObjects = [
    { position: [-5, 2, -3], color: '#d4af37', geometry: 'sphere', speed: 0.8 },
    { position: [5, -2, -2], color: '#c0c0c0', geometry: 'torus', speed: 1.2 },
    { position: [-3, -3, -4], color: '#ffd700', geometry: 'box', speed: 0.6 },
    { position: [4, 3, -3], color: '#b8860b', geometry: 'sphere', speed: 1.0 },
] as Array<{
    position: [number, number, number]
    color: string
    geometry: 'sphere' | 'torus' | 'box'
    speed?: number
}>

export function FloatingObjects({ objects = defaultObjects }: FloatingObjectsProps) {
    return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                {objects.map((obj, index) => (
                    <FloatingObject
                        key={index}
                        position={obj.position}
                        color={obj.color}
                        geometry={obj.geometry}
                        speed={obj.speed}
                    />
                ))}
            </Canvas>
        </div>
    )
}
