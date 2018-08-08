var Drum = (function() {

  function Drum(node) {
    this.node = node;
    arrangeNotes(node);
  }

  Drum.prototype.bind = function() {
    var notes = this.node.querySelectorAll('.hang-drum__note');
    var that = this;

    notes.forEach(function(note) {
      console.log(note)
      note.addEventListener('mouseover', function(e) {
        that.play(this.dataset.note);
      });
    });
  };

  Drum.prototype.play = function(noteString) {
    var audio = this.node.querySelector('[data-note='+noteString+'] audio');
    console.log(audio);
    audio.currentTime = 0;
    audio.play();
  };

  var toRadians = function(angle) {
    return angle * (Math.PI / 180);
  }

  // Private
  var arrangeNotes = function(node) {
    var startingAngle = toRadians(parseInt(node.dataset.startingAngle));
    console.log(startingAngle)
    var notes = node.querySelectorAll('.hang-drum__note');
    var angleDelta = 2*Math.PI / (notes.length-1);
    var radius = 110;

    notes.forEach(function(note) {
      loadAudio(note);
    });

    notes = Array.prototype.slice.call(notes, 1);

    notes.forEach(function(note, index) {
      var theta = startingAngle + (angleDelta * index);
      var x = Math.round(Math.cos(theta)*radius);
      var y = Math.round(Math.sin(theta)*radius);
      // console.log(note)
      note.style.transform = "translate("+x+"px, "+y+"px)";
    });
  };

  var loadAudio = function(note) {
    var noteString = note.dataset.note;
    var audio = document.createElement('audio');
    audio.src = 'audio/'+noteString+'.aif';
    audio.className = 'hidden';
    note.appendChild(audio);
  }

  return Drum;

})();


var drums = (function() {


  var drumNodes = document.querySelectorAll('.hang-drum');
  var drums = [];
  drumNodes.forEach(function(drum) {
    drum = new Drum(drum);
    drum.bind();
    drums.push(drum);
  });


  return drums;

})();
