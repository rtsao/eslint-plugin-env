/**
 * @fileoverview TODO description
 * @author Ryan Tsao
 */
'use strict';

const globals = require('globals');

const DEFAULT_ENV_IDENTIFIER = 'APP_ENV';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Checks if the given node is the argument of a typeof operator.
 * @param {ASTNode} node The AST node being checked.
 * @returns {boolean} Whether or not the node is the argument of a typeof operator.
 */
function hasTypeOfOperator(node) {
    const parent = node.parent;

    return parent.type === "UnaryExpression" && parent.operator === "typeof";
}

function report(context, identifier) {
  context.report({
    node: identifier,
    message: "'{{name}}' is not defined.",
    data: identifier
  });
}

function isEnvTest(test, identifier) {
  return (
    test.type === 'BinaryExpression' &&
    test.left.type === 'Identifier' &&
    test.left.name === identifier &&
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

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

// TODO: typeof option like https://github.com/eslint/eslint/blob/master/lib/rules/no-undef.js

module.exports = {
  meta: {
    docs: {
      description: "disallow the use of undeclared variables unless mentioned in `/*global */` comments or within a environment check",
      category: 'Variables',
    },

    schema: [
      {
        type: 'object',
        properties: {
          typeof: {
            type: 'boolean'
          },
          identifier: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {

    const options = context.options[0];
    const considerTypeOf = options && options.typeof === true || false;
    const envIdentifier = options && options.identifier || DEFAULT_ENV_IDENTIFIER;

    return {
      'Program:exit'(node) {
        const globalScope = context.getScope();

        // TODO: first filter out identifiers not in any env.
        globalScope.through.forEach(ref => {
          const identifier = ref.identifier;
          if (!considerTypeOf && hasTypeOfOperator(identifier)) {
            return;
          }
          // handle non-global identifiers as normal
          if (ref.from.type !== 'global') {
            report(context, identifier);
            return;
          }
          // whitelist APP_ENV
          if (identifier.name === envIdentifier) {
            return;
          }
          // global identifier we need to check for env check
          const parentIf = traverseToParentIf(identifier);
        
          if (parentIf && isEnvTest(parentIf.test, envIdentifier)) {
            const right = parentIf.test.right;
            if (right.type === 'Literal') {
              const value = right.value;
              // TODO: multiple environments
              if (value === 'browser') {
                if (globals.browser.hasOwnProperty(identifier.name)) {
                  return;
                }
              } else if (value === 'node') {
                if (globals.node.hasOwnProperty(identifier.name)) {
                  return;
                }
              } else {
                // some unsupported env
              }
            }
          }
          report(context, identifier);
        });
      }
    };
  }
};
