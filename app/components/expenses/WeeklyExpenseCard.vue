<template>
  <UCard class="w-full max-w-sm overflow-hidden">
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-bold tracking-tight">{{ title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ dateRange }}</p>
        </div>
        <UButton variant="ghost" size="sm" @click="onButtonClick">
          {{ buttonText }}
        </UButton>
      </div>
    </template>

    <!-- Donut chart -->
    <div class="relative my-6 flex h-48 w-full items-center justify-center">
      <svg
        :width="SIZE"
        :height="SIZE"
        :viewBox="`0 0 ${SIZE} ${SIZE}`"
        class="-rotate-90"
      >
        <!-- Background ring -->
        <circle
          :cx="SIZE / 2"
          :cy="SIZE / 2"
          :r="radius"
          fill="transparent"
          class="stroke-gray-100 dark:stroke-gray-800"
          :stroke-width="STROKE"
        />

        <!-- Coloured segments — grow from 0 to full length on mount -->
        <circle
          v-for="(seg, i) in segments"
          :key="seg.category"
          :cx="SIZE / 2"
          :cy="SIZE / 2"
          :r="radius"
          fill="transparent"
          :stroke="`hsl(${seg.hsl})`"
          :stroke-width="STROKE"
          :stroke-dashoffset="seg.dashOffset"
          stroke-linecap="round"
          :style="{
            strokeDasharray: animated
              ? `${seg.dashLen} ${circumference - seg.dashLen}`
              : `0 ${circumference}`,
            transition: `stroke-dasharray 0.6s ease-in-out ${i * 0.15}s`,
          }"
        />
      </svg>

      <!-- Centre label -->
      <div class="absolute flex flex-col items-center justify-center text-center">
        <span class="text-xs text-gray-500 dark:text-gray-400">Total Spent</span>
        <span class="text-2xl font-bold tabular-nums">{{ formatCurrency(totalAmount) }}</span>
      </div>
    </div>

    <!-- Legend grid -->
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="seg in segments"
        :key="seg.category"
        class="flex h-24 flex-col justify-end rounded-2xl bg-gray-100 dark:bg-gray-800 p-4"
      >
        <div class="flex items-center gap-2">
          <span
            class="size-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: `hsl(${seg.hsl})` }"
          />
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {{ seg.category }}
          </p>
        </div>
        <p class="mt-1 text-xl font-bold tabular-nums">{{ formatCurrency(seg.amount) }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'

import type { ChartItem } from '~/types/expense'

const props = withDefaults(defineProps<{
  title: string
  dateRange: string
  data: ChartItem[]
  buttonText?: string
  onButtonClick?: () => void
}>(), {
  buttonText: 'View Report',
})

const SIZE = 180
const STROKE = 20
const radius = (SIZE - STROKE) / 2
const circumference = 2 * Math.PI * radius

const totalAmount = computed(() => props.data.reduce((sum, i) => sum + i.amount, 0))

// Build segment geometry: dashLen = arc length, dashOffset = where the arc starts
const segments = computed(() => {
  let accumulated = 0
  return props.data.map((item) => {
    const fraction = item.percentage / 100
    const dashLen = fraction * circumference
    const dashOffset = circumference * (1 - accumulated)
    accumulated += fraction
    return { ...item, dashLen, dashOffset }
  })
})

// Trigger CSS transition after mount so segments animate in
const animated = ref(false)
onMounted(() => nextTick(() => { animated.value = true }))
</script>
