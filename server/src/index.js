import express from 'express'
import dotev from 'dotenv'
import cors from 'cors'
import routes from './routes/index.js'
import connect from './config/index.js'

dotev.config()
const app = express()

// Connect DB
connect()

app.use(cors(
  {
    origin: true,
    credentials: true,
  }
))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

routes(app)

app.listen(process.env.PORT, () => {
  console.log(`App listening at http://localhost:${process.env.PORT}`)
})