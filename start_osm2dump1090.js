const http = require('http');
const fs = require('fs');

var main_html_file = undefined;
var leaflet_css = undefined;

const server = http.createServer((req, res) => {
    console.log(" req.url = ", req.url);
    switch (req.url) {
        case '/':
            res.writeHead(200, {'Content-Type': 'text/html'});    
            res.end(main_html_file);
        case 'dist/leaflet.css':
            res.writeHead(200, {'Content-Type': 'text/css'});    
            res.end(leaflet_css);
        default:
            res.writeHead(200, {'Content-Type': 'text/html'});    
            res.end('404 Not Found');
    }
});



fs.readFile('osmmap.html', 'utf8', (err, data) => {
    if (err) throw err;
    main_html_file = data;
    //console.log(main_html_file);
  });

fs.readFile('dist/leaflet.css', 'utf8', (err, data) => {
    if (err) throw err;
   leaflet_css = data;
    //console.log(main_html_file);
  });


  /*
server.on('request', (req, res) => {
    console.log(req.url);
    console.log(req.method);
    console.log(req.headers);


    
});
*/

server.listen(3000, () => console.log("Running server"));

// TODO: сделать автоматический запуск браузера