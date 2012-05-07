blitl
=====

A skeleton project that let's you code and test directly in CoffeeScript, Jade, and LESS
using any static file server

## Using

You'll want to do a ```git clone --recursive``` to pull in the coffee-script, jade and less submodules.

Then serve the top level of the project using any static file web server.

Visit http://localhost/src/index.html and if all went well, you should see your user-agent string.

## How it works

More to come on this.  Basically, index.html is a shim that renders a jade template in your browser.
You can specify which file is rendered in ```index.js```.

When templates are compiled in-browser, ```fill.dev``` will be set:

```jade
!!! 5
head
  if fill.dev
    script(src="dev.js")
  else
    script(src="min.js")
```

blitl will pass it a block containing script tags for the in-browser versions of coffee-script and less.
You can specify where they placed in the template by yielding:

```jade
!!! 5
html
  head
    title Blitl Test
  yield
  body
    h1 Yield in the name of love
```

Becomes:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Blitl Test</title>
    <script src="../external/less.js/dist/less-1.3.0.js"></script>
    <script src="../external/coffee-script/extras/coffee-script.js"></script>
  </head>
  <body>
    <h1>Yield in the name of love</h1>
  </body>
</html>
```

Without yielding, jade will stick those script tags in the last element in your template.

Remember to include any coffeescript scripts or less stylesheets before yielding, otherwise
they won't be compiled.