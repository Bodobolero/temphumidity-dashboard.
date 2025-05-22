import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sensor, interval } = req.query
  try {
    const result = await pool.query(
      `SELECT measure_time, sensor_value 
       FROM sensorvalues 
       WHERE sensor_name = $1 AND measure_time > now() - interval '${interval}' 
       ORDER BY measure_time ASC`,
      [sensor]
    )
    res.status(200).json(result.rows)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}