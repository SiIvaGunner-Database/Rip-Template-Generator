const startTime = new Date().getTime()
const express = require("express")
const generator = require('./generator')

const app = express()
app.listen(3000)
app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})
app.use(express.static("static"))
app.use("/api/rip", (req, res) => generator.ripJsonResponse(req, res))
app.use("/api", (req, res) => generator.indexJsonResponse(req, res))

const startupTime = new Date().getTime() - startTime
console.log(`Startup completed in ${startupTime} milliseconds`)
