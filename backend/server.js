const express = require('express');
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json())


// Test Cases for POST
app.post('/api/filevideo', (request, response, next) => {
    console.log('receiving data ...');
    console.log('body is ',request.body);
    response.send(request.body);
  }) 

app.listen(process.env.PORT || 5000, ()=> {
    console.log("Started Server, Port:", process.env.PORT || 5000);
})