'use client'

import {
  formatDimensionsLabel,
  parseDimensionToInches,
  REFERENCE_PERSON_HEIGHT_IN,
  REFERENCE_PERSON_SHOULDER_IN,
} from '@/lib/products/dimensions'
import { cn } from '@/lib/utils'

type DimensionScaleCompareProps = {
  height?: string | null
  width?: string | null
  className?: string
}

const VIEW_W = 360
const VIEW_H = 240
const PAD = 28
const GAP = 28

export function DimensionScaleCompare({
  height,
  width,
  className,
}: DimensionScaleCompareProps) {
  const parsedH = parseDimensionToInches(height)
  const parsedW = parseDimensionToInches(width)

  if (parsedH == null && parsedW == null) return null

  const productHIn = parsedH ?? REFERENCE_PERSON_HEIGHT_IN
  const productWIn = parsedW ?? REFERENCE_PERSON_SHOULDER_IN

  const personHIn = REFERENCE_PERSON_HEIGHT_IN
  const personWIn = REFERENCE_PERSON_SHOULDER_IN

  const maxH = Math.max(personHIn, productHIn)
  const maxWPair = personWIn + productWIn
  const availH = VIEW_H - PAD * 2 - 24
  const availW = VIEW_W - PAD * 2 - GAP

  const scale = Math.min(availH / maxH, availW / maxWPair)

  const personH = personHIn * scale
  const personW = personWIn * scale
  const productH = productHIn * scale
  const productW = productWIn * scale

  const baseline = VIEW_H - PAD
  const personX = PAD + personW / 2
  const personTop = baseline - personH
  const productX = PAD + personW + GAP
  const productTop = baseline - productH

  const label = formatDimensionsLabel({
    height: height || null,
    width: width || null,
  })

  const ratioCaption =
    parsedH != null
      ? `Product is ~${(parsedH / personHIn).toFixed(1)}× person height`
      : parsedW != null
        ? `Product is ~${(parsedW / personWIn).toFixed(1)}× person shoulder width`
        : null

  const aria = [
    'Size comparison to a 6 foot tall person with 2 foot shoulder width.',
    label ? `Product measures ${label}.` : null,
    ratioCaption,
  ]
    .filter(Boolean)
    .join(' ')

  // Silhouette proportions relative to person bounding box
  const headR = personW * 0.28
  const shoulderY = personTop + personH * 0.22
  const hipY = personTop + personH * 0.55
  const crotchY = personTop + personH * 0.58

  return (
    <div className={cn('mt-5 space-y-3', className)}>
      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
        Scale vs. person
      </p>
      <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-4">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="mx-auto h-auto w-full max-w-md"
          role="img"
          aria-label={aria}
        >
          {/* Ground line */}
          <line
            x1={PAD - 8}
            y1={baseline}
            x2={VIEW_W - PAD + 8}
            y2={baseline}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />

          {/* Person height bracket */}
          <line
            x1={PAD - 14}
            y1={personTop}
            x2={PAD - 14}
            y2={baseline}
            stroke="rgba(184,149,107,0.7)"
            strokeWidth={1.25}
          />
          <line
            x1={PAD - 18}
            y1={personTop}
            x2={PAD - 10}
            y2={personTop}
            stroke="rgba(184,149,107,0.7)"
            strokeWidth={1.25}
          />
          <line
            x1={PAD - 18}
            y1={baseline}
            x2={PAD - 10}
            y2={baseline}
            stroke="rgba(184,149,107,0.7)"
            strokeWidth={1.25}
          />
          <text
            x={PAD - 20}
            y={(personTop + baseline) / 2}
            fill="rgba(184,149,107,0.95)"
            fontSize={10}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            textAnchor="middle"
            transform={`rotate(-90 ${PAD - 20} ${(personTop + baseline) / 2})`}
          >
            6 ft
          </text>

          {/* Person silhouette */}
          <g fill="rgba(238,240,242,0.55)">
            {/* Head */}
            <circle cx={personX} cy={personTop + headR + 2} r={headR} />
            {/* Torso / shoulders */}
            <path
              d={[
                `M ${personX - personW / 2} ${shoulderY}`,
                `Q ${personX - personW / 2} ${shoulderY - 4} ${personX - personW * 0.35} ${shoulderY - 2}`,
                `L ${personX + personW * 0.35} ${shoulderY - 2}`,
                `Q ${personX + personW / 2} ${shoulderY - 4} ${personX + personW / 2} ${shoulderY}`,
                `L ${personX + personW * 0.28} ${hipY}`,
                `L ${personX - personW * 0.28} ${hipY}`,
                'Z',
              ].join(' ')}
            />
            {/* Legs */}
            <path
              d={[
                `M ${personX - personW * 0.26} ${hipY}`,
                `L ${personX - personW * 0.08} ${crotchY}`,
                `L ${personX - personW * 0.12} ${baseline}`,
                `L ${personX - personW * 0.32} ${baseline}`,
                'Z',
              ].join(' ')}
            />
            <path
              d={[
                `M ${personX + personW * 0.26} ${hipY}`,
                `L ${personX + personW * 0.08} ${crotchY}`,
                `L ${personX + personW * 0.12} ${baseline}`,
                `L ${personX + personW * 0.32} ${baseline}`,
                'Z',
              ].join(' ')}
            />
          </g>

          {/* Shoulder width bracket */}
          <line
            x1={personX - personW / 2}
            y1={shoulderY - 10}
            x2={personX + personW / 2}
            y2={shoulderY - 10}
            stroke="rgba(184,149,107,0.75)"
            strokeWidth={1.25}
          />
          <line
            x1={personX - personW / 2}
            y1={shoulderY - 14}
            x2={personX - personW / 2}
            y2={shoulderY - 6}
            stroke="rgba(184,149,107,0.75)"
            strokeWidth={1.25}
          />
          <line
            x1={personX + personW / 2}
            y1={shoulderY - 14}
            x2={personX + personW / 2}
            y2={shoulderY - 6}
            stroke="rgba(184,149,107,0.75)"
            strokeWidth={1.25}
          />
          <text
            x={personX}
            y={shoulderY - 16}
            fill="rgba(184,149,107,0.95)"
            fontSize={9}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            textAnchor="middle"
          >
            2 ft
          </text>

          {/* Product rectangle */}
          <rect
            x={productX}
            y={productTop}
            width={Math.max(productW, 4)}
            height={Math.max(productH, 4)}
            rx={3}
            fill="rgba(184,149,107,0.08)"
            stroke="rgba(184,149,107,0.85)"
            strokeWidth={1.5}
          />

          {/* Product height label */}
          {parsedH != null && (
            <>
              <line
                x1={productX + productW + 8}
                y1={productTop}
                x2={productX + productW + 8}
                y2={baseline}
                stroke="rgba(255,255,255,0.45)"
                strokeWidth={1}
              />
              <text
                x={productX + productW + 14}
                y={(productTop + baseline) / 2}
                fill="rgba(255,255,255,0.7)"
                fontSize={9}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                textAnchor="middle"
                transform={`rotate(-90 ${productX + productW + 14} ${(productTop + baseline) / 2})`}
              >
                {height} H
              </text>
            </>
          )}

          {/* Product width label */}
          {parsedW != null && (
            <>
              <line
                x1={productX}
                y1={productTop - 8}
                x2={productX + productW}
                y2={productTop - 8}
                stroke="rgba(255,255,255,0.45)"
                strokeWidth={1}
              />
              <text
                x={productX + productW / 2}
                y={productTop - 12}
                fill="rgba(255,255,255,0.7)"
                fontSize={9}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                textAnchor="middle"
              >
                {width} W
              </text>
            </>
          )}

          {/* Legend tags */}
          <text
            x={personX}
            y={baseline + 14}
            fill="rgba(255,255,255,0.4)"
            fontSize={8}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            textAnchor="middle"
          >
            Person
          </text>
          <text
            x={productX + productW / 2}
            y={baseline + 14}
            fill="rgba(255,255,255,0.4)"
            fontSize={8}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            textAnchor="middle"
          >
            Product
          </text>
        </svg>
      </div>
      {ratioCaption ? (
        <p className="text-xs text-gray-500 font-light">{ratioCaption}</p>
      ) : null}
    </div>
  )
}
