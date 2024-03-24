const startTime = new Date().getTime()
const cors = require('cors')
const express = require("express")
const generator = require('./static/generator')

const app = express()
app.listen(3000)
app.use((req, res, next) => {
  console.log(new Date(), req.method, req.url)
  next()
})
app.use(cors())
app.use(express.static("static"))
app.use("/api/rip", async (req, res) => res.json(await generator.ripJsonResponse(req.query)))
app.use("/api", (req, res) => res.json(generator.indexJsonResponse()))

const startupTime = new Date().getTime() - startTime
console.log(new Date(), "INFO", `Startup completed in ${startupTime} milliseconds`)
