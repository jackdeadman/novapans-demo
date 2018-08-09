function getFile(filename, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(this.responseText);
    }
  };
  xhttp.open("GET", filename, true);
  xhttp.send();
}


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

var Player = (function() {

  var str2node = function(string) {
    return new DOMParser().parseFromString(string, 'text/html').body.children[0];
  };

  var icons = {
    play: "<i class='fas fa-play'></i>",
    pause: "<i class='fas fa-pause'></i>",
    stop: "<i class='fas fa-stop'></i>",
    time: "<span class='time'></span>"
  };

  function Player(node, drum) {
    var that = this;
    this.drum = drum;
    readPlaybackFile(node.dataset.file, function(lines) {
      var controls = node.querySelector('.drum-controls');

      that.time = str2node(icons.time);
      controls.prepend(that.time);

      that.stop = str2node(icons.stop);
      controls.prepend(that.stop);

      that.play = str2node(icons.play);
      controls.prepend(that.play);

      that.pause = str2node(icons.pause);
      that.pause.classList.add('hidden');
      controls.prepend(that.pause);

      that.bind(lines);
    });

    this.interval = null;
  }

  Player.prototype.bind = function(lines) {
    var that = this;
    var time = 0;
    var end = lines[lines.length-1][1];
    setTime(that.time, time, end);

    var pause = function() {
      that.play.classList.remove('hidden');
      that.pause.classList.add('hidden');
      clearInterval(that.interval);
    };

    var reset = function() {
      pause();
      time = 0;
      setTime(that.time, time, end);
    };

    this.play.addEventListener('click', function() {
      that.play.classList.add('hidden');
      that.pause.classList.remove('hidden');

      var tick = 100;
      that.interval = setInterval(function() {
        setTime(that.time, time, end)

        lines.forEach(function(line) {
          if (line[1] === time) {
            that.drum.play(line[0]);
          }
        });

        if (time > end) {
          reset();
        }

        time += tick;
      }, tick);
    });

    this.pause.addEventListener('click', pause);
    this.stop.addEventListener('click', reset);
  };

  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

  var setTime = function(node, start, end) {
    node.innerText = millisToMinutesAndSeconds(start) + ' / ' + millisToMinutesAndSeconds(end);
  };

  var readPlaybackFile = function(filename, callback) {
    getFile(filename, function(text) {
      var lines = parseFile(text);
      callback(lines);
    });
  };

  var parseFile = function(text) {
    var lines = text.split('\n');
    if (lines[lines.length-1] === '') lines.pop();

    lines = lines.map(function(line) {
      var parts = line.split(' ');
      parts[1] = parseFloat(parts[1]);
      return parts;
    });
    return lines;
  };

  return Player;

})();


var drums = (function() {

  var selectors = {
    drum: '.hang-drum',
    controls: '.hang-drum-container__player'
  };

  var drumNodes = document.querySelectorAll(selectors.drum);
  var drums = [];
  drumNodes.forEach(function(drumNode) {
    drum = new Drum(drumNode);
    drum.bind();
    drums.push(drum);

    var controlNodes = drumNode.parentNode.querySelectorAll(selectors.controls);
    controlNodes.forEach(function(controlNode) {
      var control = new Player(controlNode, drum);
      console.log(controlNode)
    });
  });

  return drums;

})();
