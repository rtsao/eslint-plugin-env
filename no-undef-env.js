const globals = require('globals');

const ENV_IDENTIFIER = 'APP_ENV';

// TODO: typeof option like https://github.com/eslint/eslint/blob/master/lib/rules/no-undef.js

export default function(context) {
  return {    
    'Program:exit'(node) {
      const globalScope = context.getScope();

      // TODO: first filter out identifiers not in any env.
      globalScope.through.forEach(ref => {
        // handle non-global identifiers as normal
        if (ref.from.type !== 'global') {
          context.report(identifier, 'not defined');
          return;
        }
        const identifier = ref.identifier;
        // whitelist APP_ENV
        if (identifier.name === ENV_IDENTIFIER) {
          return;
        }
        // global identifier we need to check for env check
        const parentIf = traverseToParentIf(identifier);
      
        if (parentIf && isEnvTest(parentIf.test)) {
          const right = parentIf.right;
          if (right.type === 'Literal') {
            // TODO: multiple environments
            if (right.name === 'browser') {
              if (globals.browser.hasOwnProperty(identifier.name) {
                return;
              }
            }
          }
        }
        context.report(identifier, 'not defined');
      });
    }
  };
};

function isEnvTest(test) {
  return (
    test.type === 'BinaryExpression' &&
    test.left.type === 'Identifier' &&
    test.left.name === ENV_IDENTIFIER &&
    (test.operator === '===' || test.operator === '!==')
  );
}

// TODO: memoize this
function traverseToParentIf(node) {
  let parent = node.parent;
  while (parent) {
    if (parent.type === 'IfStatement') {
      return parent;
    }
    parent = parent.parent;
  }
}
