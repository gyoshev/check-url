var service = require("../index.js");
var anchorRegex = service.anchorRegex;
var checkUrl = service.handler;

describe("anchor matcher", function() {
    it("is true when no id is passed", function() {
        expect(anchorRegex("").test("foo")).toBe(true);
    });

    it("is false when id is not found", function() {
        expect(anchorRegex("#foo").test("id='bar'")).toBe(false);
    });

    it("is true when id is found", function() {
        expect(anchorRegex("#foo").test("id='foo'")).toBe(true);
    });

    it("is true when id is declared in quotes", function() {
        expect(anchorRegex("#foo").test('id="foo"')).toBe(true);
    });

    it("is true when id attribute is upcase", function() {
        expect(anchorRegex("#foo").test('ID="foo"')).toBe(true);
    });

    it("is true when there is whitespace in the id attribute", function() {
        expect(anchorRegex("#foo").test('id =  "foo"')).toBe(true);
    });
});

describe("request handler", function() {
    function noop() {}
    function Request(url) {
        return { url: url };
    }
    function Response() {}
    Response.prototype = {
        writeHead: function(status, headers) {
            this.status = status;
            this.headers = headers;
        },
        end: function(content) {
            this.content = content;
        }
    };

    var response;
    var internalRequest;

    beforeEach(function() {
        response = new Response();

        internalRequest = new Request();
        service.init({ request: internalRequest });
    });

    it("sends HTTP 400 when query is not set", function() {
        checkUrl(Request("http://example.com/"), response);
        expect(response.status).toBe(400);
    });

    return;

    function queryUrl(href) {
        href = encodeURIComponent(href);
        checkUrl(Request("http://example.com/?q=" + href), response);
    }

    it("returns javascript if called with a URL", function() {
        queryUrl("http://foo.com");
        expect(response.status).toBe(200);
    });
});
