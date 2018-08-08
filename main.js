var Drum = (function() {

  var selectors = {
    note: '.hang-drum__note'
  };

  function Drum(node) {
    this.node = node;
    arrangeNotes(node);
  }

  Drum.prototype.bind = function() {
    var notes = this.node.querySelectorAll(selectors.note);
    var that = this;

    notes.forEach(function(note) {
      note.addEventListener('mouseover', function(e) {
        that.play(this.dataset.note);
      });
    });
  };

  Drum.prototype.play = function(noteString) {
    var audio = this.node.querySelector('[data-note='+noteString+'] audio');
    audio.currentTime = 0;
    audio.play();
  };

  // Private methods
  // ==============================================
  var toRadians = function(angle) {
    return angle * (Math.PI / 180);
  }

  var arrangeNotes = function(node) {
    var startingAngle = toRadians(parseInt(node.dataset.startingAngle || 0));
    var notes = node.querySelectorAll(selectors.note);
    var angleDelta = 2*Math.PI / (notes.length-1);
    var radius = node.dataset.radius || 110;

    notes.forEach(function(note) {
      loadAudio(note, node);
    });

    // The first note starts in the center
    notes = Array.prototype.slice.call(notes, 1);

    // Parametric equation of a circle to draw notes around the drum
    notes.forEach(function(note, index) {
      var theta = startingAngle + (angleDelta * index);
      var x = Math.round(Math.cos(theta)*radius);
      var y = Math.round(Math.sin(theta)*radius);
      note.style.transform = "translate("+x+"px, "+y+"px)";
    });
  };

  var loadAudio = function(note, node) {
    var audio = document.createElement('audio');
    audio.src = getAudioFileName(note, node);
    audio.className = 'hidden';
    note.appendChild(audio);

    audio.addEventListener('play', handlers.playHandler);
    audio.addEventListener('ended', handlers.stopHandler);
  };

  var getAudioFileName = function(note, node) {
    var data = node.dataset;
    var note = note.dataset.note;
    return data.fileLocation + '/' + note + '.' +(data.extension || 'mp3');
  };

  var handlers = {
    playHandler: function(e) { e.target.parentNode.classList.add('active') },
    stopHandler: function(e) { e.target.parentNode.classList.remove('active') }
  };

  return Drum;

})();


var drums = (function() {

  var selectors = {
    drum: '.hang-drum'
  };

  var drumNodes = document.querySelectorAll(selectors.drum);
  var drums = [];
  drumNodes.forEach(function(drum) {
    drum = new Drum(drum);
    drum.bind();
    drums.push(drum);
  });

  return drums;

})();
