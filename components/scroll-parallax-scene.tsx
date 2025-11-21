'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

function ParallaxSphere({ scrollProgress }: { scrollProgress: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!meshRef.current) return

        const time = state.clock.getElapsedTime()
        meshRef.current.rotation.x = time * 0.2
        meshRef.current.rotation.y = time * 0.3

        // Move based on scroll
        meshRef.current.position.y = scrollProgress * 5 - 2
        meshRef.current.position.z = -5 + scrollProgress * 3
    })

    return (
        <mesh ref={meshRef} position={[3, 0, -5]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
                color="#d4af37"
                wireframe
                transparent
                opacity={0.4}
            />
        </mesh>
    )
}

function ParallaxRing({ scrollProgress }: { scrollProgress: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!meshRef.current) return

        const time = state.clock.getElapsedTime()
        meshRef.current.rotation.x = Math.PI / 4 + time * 0.1
        meshRef.current.rotation.z = time * 0.2

        // Move based on scroll (different speed for parallax)
        meshRef.current.position.y = -scrollProgress * 3
        meshRef.current.position.x = -3 + scrollProgress * 2
    })

    return (
        <mesh ref={meshRef} position={[-3, 0, -4]}>
            <torusGeometry args={[1.5, 0.1, 16, 100]} />
            <meshStandardMaterial
                color="#ffd700"
                transparent
                opacity={0.3}
                metalness={0.9}
                roughness={0.1}
            />
        </mesh>
    )
}

export function ScrollParallaxScene() {
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = Math.min(window.scrollY / Math.max(scrollHeight, 1), 1)
            setScrollProgress(progress)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial call

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <ParallaxSphere scrollProgress={scrollProgress} />
                <ParallaxRing scrollProgress={scrollProgress} />
            </Canvas>
        </div>
    )
}
