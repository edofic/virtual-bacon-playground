var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var Bacon = require('baconjs');
window.Bacon = Bacon;

// 1: Create a function that declares what the DOM should look like
function render(count)  {
    return h('div', {
        style: {
            textAlign: 'center',
            lineHeight: (100 + count) + 'px', 
            border: '1px solid red',
            width: (100 + count) + 'px',
            height: (100 + count) + 'px'
        }
    }, [String(count)]);
}

// 2: Initialise the document
var initialCount = 0;      // We need some app data. Here we just store a count.

var initialTree = render(initialCount);               // We need an initial tree
var rootNode = createElement(initialTree);     // Create an initial root DOM node ...
document.body.appendChild(rootNode);    // ... and it should be in the document

var streamCount = Bacon
  .repeatedly(1000, [1])
  .scan(initialCount, function(count, step) { return count + step });

var streamTree = streamCount.map(render);
var streamState = streamTree.scan([initialTree], function(state, cur) {
  var prev = state[0];
  var patches = diff(prev, cur);
  return [cur, patches];
}).skip(1).forEach(function(state) {
  var patches = state[1];   
  patch(rootNode, patches);
});
