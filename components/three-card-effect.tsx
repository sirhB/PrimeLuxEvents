'use client'

import { useRef, useState, type ReactNode } from 'react'

interface ThreeCardEffectProps {
    children: ReactNode
    intensity?: number
    className?: string
}

export function ThreeCardEffect({
    children,
    intensity = 15,
    className = ''
}: ThreeCardEffectProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [rotation, setRotation] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return

        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const mouseX = e.clientX - centerX
        const mouseY = e.clientY - centerY

        const rotateY = (mouseX / (rect.width / 2)) * intensity
        const rotateX = -(mouseY / (rect.height / 2)) * intensity

        setRotation({ x: rotateX, y: rotateY })
    }

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 })
        setIsHovering(false)
    }

    const handleMouseEnter = () => {
        setIsHovering(true)
    }

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            className={`transition-transform duration-200 ${className}`}
            style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${isHovering ? 'scale(1.02)' : 'scale(1)'}`,
                transformStyle: 'preserve-3d',
            }}
        >
            <div
                style={{
                    transform: 'translateZ(20px)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {children}
            </div>
        </div>
    )
}
