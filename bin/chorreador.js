var fs         = require('fs'),
    path       = require('path'),
    chorreador = require('../'),
    yargs      = require('yargs');

var argv = yargs.usage('Usage: chorreador server|instrument ...').demand(1).argv;
var command = argv._[0];
switch(command) {
case 'server':
  argv = yargs.usage('Usage: chorreador server --port NUM --dir DIR').
               default('port', 3000).
               default('dir', 'instrumented').
               argv;
  var server = new chorreador.Server(argv.port, argv.dir);
  server.run();
  break;
case 'instrument':
    var usage = 'Usage: chorreador instrument FILE --include_def';
    argv = yargs.usage(usage).
                 demand(1).
                 boolean(['include_def']).
                 argv;

  var fileName     = argv._[1];
  var Instrumentor = chorreador.Instrumentor;
  var tracer       = new chorreador.ConsoleTracer();
  var ext          = path.extname(fileName);

  fs.readFile(fileName, (err, code) => {
    switch(ext) {
    case '.js':
      var source = new chorreador.Source(fileName, code.toString()),
          code   = Instrumentor.instrumentFunctionTrace(source, tracer);
      if(argv.include_def) {
        source.code = code;
        code        = Instrumentor.instrumentFunctionTraceDefinition(source,
                                                                     tracer);
        console.log(code);
      }
      break;
    case '.html':
      var page    = new chorreador.Page('', fileName, code.toString()),
          profile = new chorreador.Profile(page),
          code    = Instrumentor.instrumentFunctionTraceDefinition2Page(page,
                                                                        profile,
                                                                        tracer);
      console.log(code);
    }

  });
};