const http = require("http");
const fs = require("fs");
const server = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/html");
  fs.readFile("./views/index.html", (error, data) => {
    if (error) {
      console.log(err);
      response.end("A server error occurred!");
    }
    response.end(data);
  });
}).listen(process.env.PORT || 8080);
