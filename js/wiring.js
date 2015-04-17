var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var Delegator = require('dom-delegator')

module.exports.delegator = Delegator();

module.exports.wire = function (streamTree) {
  var latestTree = undefined;
  var nextTree = undefined;
  var root = undefined;
  var inProgress = false;
  var unsub = streamTree.forEach(function (tree) {
    nextTree = tree;
    if (inProgress) {
      return;
    }
    if (root == undefined || latestTree == undefined) {
      root = createElement(tree);
      document.body.appendChild(root);
      latestTree = tree;
      return;
    }
    inProgress = true;
    requestAnimationFrame(function() {
      inProgress = false;
      root = patch(root, diff(latestTree, nextTree));
      latestTree = nextTree;
    });
  });
  return unsub;
}

