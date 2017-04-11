'use strict';

module.exports = function transform(el, context) {
    if(!el.argument) {
        context.addError('Invalid <for-stream> tag. Argument is missing. Example: <for-stream(data from data.userStream)>');
        return;
    }

    var match = /^([$A-Z_][0-9A-Z_$]*) from (.*)$/i.exec(el.argument);

    if(!match) {
        context.addError('Invalid <for-stream> tag. Argument is malformed. Example: <for-stream(data from data.userStream)>');
        return;
    }

    var varName = match[1];
    var dataProviderAttr = match[2];

    if (!context.util.isValidJavaScriptIdentifier(varName)) {
        context.addError('Invalid <for-stream> tag. Argument\'s variable name should be a valid JavaScript identifier. Example: user, as in <for-stream(data from data.userStream)>');
        return;
    }

    var builder = context.builder;

    el.setAttributeValue('_var', builder.literal(varName));
    el.setAttributeValue('_dataProvider', builder.parseExpression(dataProviderAttr));
    el.argument = null;
};
