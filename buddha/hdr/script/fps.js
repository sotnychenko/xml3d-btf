// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.ieRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var numFramesToAverage = 16;
var frameTimeHistory = [];
var frameTimeIndex = 0;
var totalTimeForFrames = 0;

var fpsElement = document.getElementById("fpsId");

var then = Date.now() / 1000;  // get time in seconds
var render = function() {
    var now = Date.now() / 1000;  // get time in seconds
    
    // compute time since last frame
    var elapsedTime = now - then;
    then = now;
    
    // update the frame history.
    // Add the new time and substract the oldest time from the total
    totalTimeForFrames += elapsedTime - (frameTimeHistory[frameTimeIndex] || 0);
    // record the new time
    frameTimeHistory[frameTimeIndex] = elapsedTime;
    // advance the history index.
    frameTimeIndex = (frameTimeIndex + 1) % numFramesToAverage;
    
    // compute fps
    var averageElapsedTime = totalTimeForFrames / numFramesToAverage;
    var fps = 1 / averageElapsedTime;
    fpsElement.innerText = fps.toFixed(0); 
  
    requestAnimFrame(render);
};
render();
