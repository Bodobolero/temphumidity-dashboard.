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

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const intervals = ['1 hour', '1 day', '7 day', '15 day']

function SensorChart({ label, data }: { label: string, data: any[] }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-2">{label}</h2>
      <Line
        data={{
          labels: data.map((d: any) => new Date(d.measure_time)),
          datasets: [{
            label,
            data: data.map((d: any) => d.sensor_value),
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
  const [temperatureData, setTemperatureData] = useState([])
  const [humidityData, setHumidityData] = useState([])

  useEffect(() => {
    fetch(`/api/sensorvalues?sensor=temperature&interval=${interval}`)
      .then(res => res.json())
      .then(setTemperatureData)

    fetch(`/api/sensorvalues?sensor=humidity&interval=${interval}`)
      .then(res => res.json())
      .then(setHumidityData)
  }, [interval])

  return (
    <div className="p-4">
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

      <SensorChart label="Temperature" data={temperatureData} />
      <SensorChart label="Humidity" data={humidityData} />
    </div>
  )
}