var vm = require('vm');

module.exports = function(nunjucks) {
    return function DoExtension(_env) {
        this.tags = ['do'];

        this.parse = function(parser, nodes, lexer) {
            var tok = parser.nextToken();
            var { index:start, lineno, colno } = parser.tokens;

            while (tok.type !== lexer.TOKEN_BLOCK_END) {
                var end = parser.tokens.index;
                tok = parser.nextToken();
            }

            var body, doString = parser.tokens.str.slice(start, end);
            if (doString) {
                body = new nodes.Output(lineno, colno, [ new nodes.TemplateData(lineno, colno, doString) ]);
            } else {
                body = parser.parseUntilBlocks('enddo');
                parser.advanceAfterBlockEnd();
            }

            return new nodes.CallExtension(this, 'run', null, [body]);
        };

        this.run = function(context, body) {
            var js = body();

            vm.runInNewContext(js, context.ctx);
            return '';
        };
    };
};
