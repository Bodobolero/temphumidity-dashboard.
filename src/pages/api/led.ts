import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { state } = req.body
  if (!['on', 'off'].includes(state)) {
    return res.status(400).json({ error: 'Invalid state' })
  }

  try {
    await pool.query(
      `INSERT INTO actorvalues (actor_name, actor_value) VALUES ('led', $1)`,
      [state]
    )
    res.status(200).json({ status: 'ok', state })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}