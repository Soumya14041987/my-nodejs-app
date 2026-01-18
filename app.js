const port = process.env.PORT || 3000;
const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper for logging
const log = function(entry) {
    const logPath = '/tmp/sample-app.log';
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `${timestamp} - ${entry}\n`);
};

const server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        let body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url === '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            // POST response remains plain text
            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end('Success');
        });
    } else {
        // Handling GET requests (The UI display)
        const filePath = path.join(__dirname, 'index.html');

        if (fs.existsSync(filePath)) {
            const html = fs.readFileSync(filePath);
            
            // FIX: Explicitly set 'text/html' so the browser renders the UI
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(html);
            res.end();
        } else {
            // Fallback if index.html is missing
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404: index.html not found at root.');
        }
    }
});

server.listen(port);

console.log(`Server running at http://127.0.0.1:${port}/`);
