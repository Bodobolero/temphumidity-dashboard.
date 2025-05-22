'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

type SensorValue = {
  measure_time: string
  sensor_value: number
}

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend)


const intervals = ['1 hour', '1 day', '7 day', '15 day']

function SensorChart({ label, data }: { label: string, data: SensorValue[] }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-2">{label}</h2>
      <Line
        data={{
          labels: data.map(d => new Date(d.measure_time)),
          datasets: [{
            label,
            data: data.map(d => d.sensor_value),
            borderWidth: 2,
            fill: false,
          }],
        }}
        options={{
          scales: {
            x: { type: 'time' },
            y: { beginAtZero: false },
          },
        }}
      />
    </div>
  )
}

export default function Home() {
  const [interval, setInterval] = useState('1 hour')
  const [temperatureData, setTemperatureData] = useState<SensorValue[]>([])
  const [humidityData, setHumidityData] = useState<SensorValue[]>([])
  const [ledState, setLedState] = useState<'on' | 'off'>('off')

  // Load actual LED state once
  useEffect(() => {
    fetch('/api/led-state')
      .then(res => res.json())
      .then(data => {
        if (data?.state === 'on' || data?.state === 'off') {
          setLedState(data.state)
        }
      })
  }, [])


  function toggleLed() {
    const nextState = ledState === 'off' ? 'on' : 'off'
    fetch('/api/led', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: nextState })
    }).then(res => {
      if (res.ok) {
        // Reload actual state from DB to confirm it was recorded
        fetch('/api/led-state')
          .then(res => res.json())
          .then(data => {
            if (data?.state === 'on' || data?.state === 'off') {
              setLedState(data.state)
            }
          })
      }
    })
  }
  useEffect(() => {
    const fetchData = () => {
      fetch(`/api/sensorvalues?sensor=temperature&interval=${interval}`)
        .then(res => res.json())
        .then(setTemperatureData)

      fetch(`/api/sensorvalues?sensor=humidity&interval=${interval}`)
        .then(res => res.json())
        .then(setHumidityData)
    }

    fetchData() // initial load

    const intervalId = window.setInterval(fetchData, 60_000)

    return () => clearInterval(intervalId) // cleanup on unmount
  }, [interval])

  return (
  <div className="p-4">
    {/* Time range buttons */}
    <div className="flex gap-4 mb-4">
      {intervals.map(i => (
        <button
          key={i}
          onClick={() => setInterval(i)}
          className={`px-4 py-2 rounded border ${i === interval ? 'bg-gray-200' : ''}`}
        >
          {i}
        </button>
      ))}
    </div>

    {/* LED toggle button */}
    <div className="mb-4">
      <button
        onClick={toggleLed}
        className="px-4 py-2 border rounded bg-blue-200 hover:bg-blue-300"
      >
        Toggle LED (currently {ledState})
      </button>
    </div>

    {/* Sensor charts */}
    <SensorChart label="Temperature" data={temperatureData} />
    <SensorChart label="Humidity" data={humidityData} />
  </div>
)
}