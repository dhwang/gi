/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.net.URI", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.net.URI.jsxclass");
  var t = new _jasmine_test.TestSuite("jsx3.net.URI");

  beforeEach(function () {

  });

  it("testAuthority", function () {
    expect("www.domain.com").toEqual((new jsx3.net.URI("http://www.domain.com/path/file.html").getAuthority()));
    expect("user@domain.com").toEqual((new jsx3.net.URI("//user@domain.com/path/").getAuthority()));
    expect("domain.com:666").toEqual((new jsx3.net.URI("torrent://domain.com:666/").getAuthority()));
    expect("").toEqual((new jsx3.net.URI("file:///file.txt").getAuthority()));
    expect((new jsx3.net.URI("file:/file.txt").getAuthority())).toBeNull();
  });

  it("testFragment", function () {
    expect("fragment").toEqual((new jsx3.net.URI("scheme:ssp#fragment").getFragment()));
    expect("fragment").toEqual((new jsx3.net.URI("http://www.domain.com/path/file.html#fragment").getFragment()));
    expect("").toEqual((new jsx3.net.URI("http://www.domain.com/path/file.html#").getFragment()));
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").getFragment())).toBeNull();
  });

  it("testHost", function () {
    expect("www.domain.com").toEqual((new jsx3.net.URI("http://www.domain.com/path/file.html").getHost()));
    expect("domain.com").toEqual((new jsx3.net.URI("//user@domain.com/path/").getHost()));
    expect((new jsx3.net.URI("scheme:ssp#fragment").getHost())).toBeNull();
    expect("").toEqual((new jsx3.net.URI("file:///file.txt").getHost()));
    expect((new jsx3.net.URI("/file.txt").getHost())).toBeNull();
  });

  it("testIPv6", function () {
    expect("[1080:0:0:0:8:800:200C:4171]").toEqual((new jsx3.net.URI("http://[1080:0:0:0:8:800:200C:4171]/path/file.html").getHost()));
    expect("[::192.9.5.5]").toEqual((new jsx3.net.URI("//user@[::192.9.5.5]/path/").getHost()));
    expect((new jsx3.net.URI("//user@[::192.9.5.5]/path/").getPort())).toBeNull();
    expect("[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]").toEqual((new jsx3.net.URI("http://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:8080/").getHost()));
    expect(8080).toEqual((new jsx3.net.URI("http://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:8080/").getPort()));
  });

  it("testPath", function () {
    expect("/path/file.html").toEqual((new jsx3.net.URI("http://www.domain.com/path/file.html").getPath()));
    expect("/file.txt").toEqual((new jsx3.net.URI("/file.txt").getPath()));
    expect("/file.txt").toEqual((new jsx3.net.URI("/file.txt#fragment").getPath()));
    expect("/file.txt").toEqual((new jsx3.net.URI("/file.txt?query").getPath()));
    expect((new jsx3.net.URI("scheme:ssp#fragment").getPath())).toBeNull();
  });

  it("testPort", function () {
    expect(666).toEqual((new jsx3.net.URI("torrent://domain.com:666/").getPort()));
    expect(80).toEqual((new jsx3.net.URI("//user@domain.com:80/path/").getPort()));
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").getPort())).toBeNull();
  });

  it("testQuery", function () {
    expect("query").toEqual((new jsx3.net.URI("http://www.domain.com/path/file.html?query").getQuery()));
    expect((new jsx3.net.URI("scheme:ssp?query").getQuery())).toBeNull();
    ; // illegal
    expect("query").toEqual((new jsx3.net.URI("/file.txt?query").getQuery()));
    expect("query").toEqual((new jsx3.net.URI("/file.txt?query#fragment").getQuery()));
  });

  it("testScheme", function () {
    expect("scheme").toEqual((new jsx3.net.URI("scheme:ssp#fragment").getScheme()));
    expect("http").toEqual((new jsx3.net.URI("http://www.domain.com/path/file.html?query").getScheme()));
    expect("C").toEqual((new jsx3.net.URI("C:/file.txt").getScheme()));
    expect((new jsx3.net.URI("./C:/file.txt").getScheme())).toBeNull();
    expect((new jsx3.net.URI("/file.txt?query").getScheme())).toBeNull();
    expect((new jsx3.net.URI("//user@domain.com:80/path/").getScheme())).toBeNull();
  });

  it("testSchemeSpecificPart", function () {
    expect("ssp").toEqual((new jsx3.net.URI("scheme:ssp#fragment").getSchemeSpecificPart()));
    expect("//www.domain.com/path/file.html").toEqual((new jsx3.net.URI("http://www.domain.com/path/file.html").getSchemeSpecificPart()));
    expect("/file.txt?query").toEqual((new jsx3.net.URI("/file.txt?query").getSchemeSpecificPart()));
  });

  it("testUserInfo", function () {
    expect("user").toEqual((new jsx3.net.URI("//user@domain.com:80/path/").getUserInfo()));
    expect((new jsx3.net.URI("/file.txt?query").getUserInfo())).toBeNull();
    expect("").toEqual((new jsx3.net.URI("scheme://@host/path").getUserInfo()));
  });

  it("testQueryParam", function () {
    var u = new jsx3.net.URI("/path?q1&q2=v2&q3=v3#fragment");
    expect(true).toEqual(u.getQueryParam("q1"));
    expect("v2").toEqual(u.getQueryParam("q2"));
    expect("v3").toEqual(u.getQueryParam("q3"));
    expect(u.getQueryParam("q4")).toBeNull();
    u = new jsx3.net.URI("/path#fragment");
    expect(u.getQueryParam("q1")).toBeNull();
  });

  it("testQueryParams", function () {
    var u = new jsx3.net.URI("/path?q1&q2=v2&q3=v3#fragment");
    var p = u.getQueryParams();
    expect(p).toBeInstanceOf(Object);
    expect(true).toEqual(p.q1);
    expect("v2").toEqual(p.q2);
    expect("v3").toEqual(p.q3);
    expect(p.q4).toBeUndefined();
  });

  it("testAbsolute", function () {
    expect((new jsx3.net.URI("scheme:ssp#fragment").isAbsolute())).toBeTruthy();
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").isAbsolute())).toBeTruthy();
    expect((new jsx3.net.URI("mailto:user@domain.com").isAbsolute())).toBeTruthy();
    expect((new jsx3.net.URI("/path/file.txt").isAbsolute())).toBeFalsy();
    expect((new jsx3.net.URI("//domain.com/path/file.txt").isAbsolute())).toBeFalsy();
    expect((new jsx3.net.URI("file.txt").isAbsolute())).toBeFalsy();
  });

  it("testOpaque", function () {
    expect((new jsx3.net.URI("scheme:ssp#fragment").isOpaque())).toBeTruthy();
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").isOpaque())).toBeFalsy();
    expect((new jsx3.net.URI("mailto:user@domain.com").isOpaque())).toBeTruthy();
    expect((new jsx3.net.URI("/path/file.txt").isOpaque())).toBeFalsy();
  });

  it("testEquals", function () {

    var u = new jsx3.net.URI("http://www.domain.com/path/file.html");
    expect(u.equals(u)).toBeTruthy();
    expect(u.equals(null)).toBeFalsy();
    expect(u.equals(1)).toBeFalsy();
    expect(u.equals("http://www.domain.com/path/file.html")).toBeFalsy();

    expect(u.equals(new jsx3.net.URI("http://www.domain.com/path/file.html"))).toBeTruthy();
    expect(u.equals(new jsx3.net.URI("http://www.domain.com/path/%66ile.html"))).toBeTruthy();

    u = new jsx3.net.URI("/file.html?query#fragment");
    expect(u.equals(new jsx3.net.URI("/file.html?query#fragment"))).toBeTruthy();
    expect(u.equals(new jsx3.net.URI("/file.html?query2#fragment"))).toBeFalsy();
    expect(u.equals(new jsx3.net.URI("/file.html?query#fragment2"))).toBeFalsy();
  });

  it("testValueOf", function () {
    var s = "http://www.domain.com/path/file.html";
    var u = jsx3.net.URI.valueOf(s);
    expect(u).toBeInstanceOf(jsx3.net.URI);
    expect(s).toEqual(u.toString());
    expect(u == jsx3.net.URI.valueOf(u)).toBeTruthy();
  });

  it("testFromParts3", function () {
    expect("scheme:ssp#fragment").toEqual(jsx3.net.URI.fromParts("scheme", "ssp", "fragment").toString());
    expect("scheme:ssp#").toEqual(jsx3.net.URI.fromParts("scheme", "ssp", "").toString());
    expect("scheme:ssp").toEqual(jsx3.net.URI.fromParts("scheme", "ssp", null).toString());
    expect("ssp").toEqual(jsx3.net.URI.fromParts(null, "ssp", null).toString());
  });

  it("testFromParts7", function () {
    expect("scheme://userInfo@host:81/path?query#fragment").toEqual(
      jsx3.net.URI.fromParts("scheme", "userInfo", "host", 81, "/path", "query", "fragment").toString());
  });

  it("testNormalize", function () {
    var u = new jsx3.net.URI("http://www.domain.com/path/file.html");
    expect(u == u.normalize()).toBeTruthy();

    expect("file1.txt").toEqual(new jsx3.net.URI("./file1.txt").normalize().toString());
    expect("../file.txt").toEqual(new jsx3.net.URI("../file.txt").normalize().toString());
    expect("file2.txt").toEqual(new jsx3.net.URI("foo/../file2.txt").normalize().toString());
    expect("../file.txt").toEqual(new jsx3.net.URI("foo/../../file.txt").normalize().toString());
    expect("./C:/file1.txt").toEqual(new jsx3.net.URI("./C:/file1.txt").normalize().toString());
    expect("./C:/file2.txt").toEqual(new jsx3.net.URI("foo/../C:/file2.txt").normalize().toString());
    expect("file:///C:/file.txt").toEqual(new jsx3.net.URI("file:///C:/file.txt").normalize().toString());
  });

  var resolveTests = [
    ["path/to/file.txt", "http://www.example.com/file.txt", "http://www.example.com/file.txt"],
    ["mailto:gi@example.com", "../file.txt", "../file.txt"],
    ["http://www.example.com/file.txt?a=b", "#frag", "http://www.example.com/file.txt?a=b#frag"],
    ["http://www.example.com/file.txt", "//u@power.example.com/file.html", "http://u@power.example.com/file.html"],
    ["http://www.example.com/file.txt", "/dir/file.html?a=b", "http://www.example.com/dir/file.html?a=b"],
    ["/file.txt", "/dir/file.html", "/dir/file.html"],
    ["/a/b/c/file.txt", "../file.html", "/a/b/file.html"],
    ["/a/b/c/file.txt", "file.html", "/a/b/c/file.html"],
    ["/a/b/c/", "file.html", "/a/b/c/file.html"]
  ];

  for (var i = 0; i < resolveTests.length; i++) {
    var touple = resolveTests[i];
    t["testResolve" + i] = gi.test.jasmine.makeTestFunction(function (u1, u2, u3) {
      u1 = jsx3.net.URI.valueOf(u1);
      u2 = jsx3.net.URI.valueOf(u2);
      u3 = jsx3.net.URI.valueOf(u3);
      expect(u3).toEqual(u1.resolve(u2));
    }, touple[0], touple[1], touple[2]);
  }

  var relativizeTests = [
    ["mailto:gi@example.com", "file.txt", "file.txt"],
    ["file.txt", "mailto:gi@example.com", "mailto:gi@example.com"],
    ["http://localhost/file.html", "file://localhost/file.html", "file://localhost/file.html"],
    ["http://www.example.com/file.html", "http://power.example.com/dir/file.html", "http://power.example.com/dir/file.html"],
    ["file:///file.txt", "file:/dir/file.txt", "/dir/file.txt"],
    ["a/b/c/file.txt", "a/b/d/file.html", "../d/file.html"],
    ["/file.txt", "/file.html", "/file.html"],
    ["/a/file.txt", "/a/file.html", "file.html"],
    ["http://www.example.com/dir/file.html", "http://www.example.com/file.html", "/file.html"],
    ["http://www.example.com/a/dir/file.html", "http://www.example.com/a/file.html", "../file.html"],
    ["http://www.example.com/dir/file.html", "http://u@www.example.com/file.html", "http://u@www.example.com/file.html"]
  ];

  for (var i = 0; i < relativizeTests.length; i++) {
    var touple = relativizeTests[i];
    t["testRelativize" + i] = gi.test.jasmine.makeTestFunction(function (u1, u2, u3) {
      u1 = jsx3.net.URI.valueOf(u1);
      u2 = jsx3.net.URI.valueOf(u2);
      u3 = jsx3.net.URI.valueOf(u3);
      expect(u3).toEqual(u1.relativize(u2));
    }, touple[0], touple[1], touple[2]);
  }

});
