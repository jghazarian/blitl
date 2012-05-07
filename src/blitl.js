/* Jade.js is not intended to be used in the browser.
 * The ```include``` keyword, for instance, will fail
 * when parsing templates.
 * But, we can patch jade's Parser to use XMLHttpRequest.
 */

/* This is from path.js in the node lib */

// Regex to split a windows path into three parts: [*, device, slash,
// tail] windows-only
var splitDeviceRe =
  /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?([\\\/])?([\s\S]*?)$/;

// Regex to split the tail part of the above into [*, dir, basename, ext]
var splitTailRe =
  /^([\s\S]+[\\\/](?!$)|[\\\/])?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/\\]*)?)$/;

function splitPath(filename) {
  // Separate device+slash from tail
  var result = splitDeviceRe.exec(filename),
  device = (result[1] || '') + (result[2] || ''),
  tail = result[3] || '';
  // Split the tail into dir, basename and extension
  var result2 = splitTailRe.exec(tail),
  dir = result2[1] || '',
  basename = result2[2] || '',
  ext = result2[3] || '';
  return [device, dir, basename, ext];
};

function basename(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

function dirname(path) {
  var result = splitPath(path),
  root = result[0],
  dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substring(0, dir.length - 1);
  }

  return root + dir;
};

/* Fake fs module that */

fs = {
  readFileSync: function(path) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', path, false);
    xmlHttp.send();
    return xmlHttp.responseText;
  }
};

/* Patched Jade Parser */

var Parser = jade.Parser;

jade.Parser.prototype.parseInclude = function(path) {
  var path = this.expect('include').val.trim();

  // no extension
  if (!~basename(path).indexOf('.')) {
    path += '.jade';
  }

  // non-jade
  if ('.jade' != path.substr(-5)) {
    var str = fs.readFileSync(path, 'utf8');
    return new nodes.Literal(str);
  }

  var str = fs.readFileSync(path, 'utf8')
    , parser = new Parser(str, path, this.options);
  parser.blocks = this.blocks;
  parser.mixins = this.mixins;

  this.context(parser);
  var ast = parser.parse();
  this.context();
  ast.filename = path;

  if ('indent' == this.peek().type) {
    ast.includeBlock().push(this.block());
  }

  return ast;
};

/* blitl code */

// Compile template
var shim =
  [ 'include ' + blitl.index,
    '  script(src="../external/less.js/dist/less-1.3.0.js")',
    '  script(src="../external/coffee-script/extras/coffee-script.js")'
  ].join('\n');
var html = jade.compile(shim)({ fill: { dev: true } });

// Write out HTML
document.open();
document.write(html);
document.close();
