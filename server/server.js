import http from 'http'
import fs from 'fs'
import url from 'url'
import path from 'path'

// it handles incoming requests
function requestHandler(request, response) {
  let requestedResource = path.join(
    __dirname, // current directory were server is found
    '../public', // step outside in to public dir
    url.parse(request.url).pathname // path to resource requested by client
  )

  // check if resource exists
  fs.exists(requestedResource, function(exists) {
    // if does not exist return 404
    if (!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"})
      response.write("404 Not Found\n")
      response.end()
      return
    }
    // check if resource is dir if so use index.html
    if (fs.statSync(requestedResource).isDirectory()) {
      requestedResource += '/index.html'
    }

    // we read requested file
    fs.readFile(
      requestedResource, // path to resource
      "binary", // read file as binary file
      function(err, file) { // callback to handle end of file reading
        if(err) {
          response.writeHead(500, {"Content-Type": "text/plain"})
          response.write(err + "\n")
          response.end()
          return
        }
        // map request content types
        const contentTypesByExtension = {
          '.html': "text/html", 
          '.css': "text/css", 
          '.js': "text/javascript"
        }
        // helper for headers
        const headers = {}
        // get type using requsted resource extendsion
        const contentType = contentTypesByExtension[
          path.extname(requestedResource)
        ]

        // if request maps to extension set it as content type for response
        if (contentType) {
          headers["Content-Type"] = contentType
        }

        response.writeHead(200, headers) // write header if any
        response.write(file, "binary") // write content of read file
        response.end()
      }
    )
  })
}

// create http server and pass it request handler callback
const server = http.createServer(requestHandler)
const portNumber = 3030

server.listen(portNumber, function() {
  console.log(`Server listening on ${portNumber}`);
})