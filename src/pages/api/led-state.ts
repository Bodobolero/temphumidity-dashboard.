import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query(`
      SELECT actor_value
      FROM actorvalues
      WHERE actor_name = 'led'
      ORDER BY sent_time DESC
      LIMIT 1
    `)
    const state = result.rows[0]?.actor_value ?? 'off'
    res.status(200).json({ state })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}