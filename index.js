var url = require('url');
var request;

function anchorRegex(id) {
    if (id) {
        id = id.substring(1);
        return new RegExp("(id|ID)\\s*=\\s*('|\")" + id + "\\2");
    } else {
        return /./;
    }
}

function handler(req, res) {
    var query = url.parse(req.url, true).query;
    var targetUrl = query && query.q && url.parse(query.q);

    if (!targetUrl) {
        res.writeHead(400);
        res.end();

        return;
    }

    request(targetUrl.href, function (error, response, body) {
        var statusOK = !error && response.statusCode == 200;
        var result = { status: "ok" };
        var hashExists = !error && anchorRegex(targetUrl.hash).test(body);
        var callback = query.callback || "callback";

        res.writeHead(200, {'Content-Type': 'text/javascript'});

        if (error || !statusOK || !hashExists) {
            result.status = "error";

            if (error) {
                result.reason = error;
            } else if (!statusOK) {
                result.reason = "Page returned status " + response.statusCode;
            } else {
                result.reason = "Hash does not exist";
            }
        }

        res.end(callback + "(" + JSON.stringify(result) + ")");
    })
};

module.exports = {
    init: function(options) {
        request = options.request;
    },
    anchorRegex: anchorRegex,
    handler: handler
};

// run server if run from command-line
if (require.main === module) {
    var port = 4040;
    request = require('request');
    require('http').createServer(handler).listen(port);
    console.log("Started server on port", port);
}
