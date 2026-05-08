import { Hono } from 'hono'
import {Version} from "bcdice";

const app = new Hono()

app.get('/', (c) => {
  return c.text(`BCDice Version: ${Version}`)
})

export default app
