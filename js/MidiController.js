var MidiController = (function(onNoteOn, onAllNotesOff) {

  var notes = [];

  var init = function() {
    if (navigator.requestMIDIAccess)
      navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure);
    else
      alert("No MIDI support!")
  };

  function onMIDIFailure(e) {
    alert("No MIDI support: " + e);
  }

  function onMIDISuccess(midiAccess) {
    for (var i = 0; i < 128; i++)
      notes.push(0);

    var inputs = midiAccess.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
      input.value.onmidimessage = onMIDIMessage;
    }
  }

  function onMIDIMessage(message) {
    // Don't care about system messages, only channel messages
    if (message.data[0] >= 0b11110000)
      return;

    var type = message.data[0] >> 4;
    console.log("Type: " + type);
    console.log("MIDI Channel: " + ((message.data[0] & 0xf)+1));

    // 9 == "Note On"
    if (type == 9) {
      var note = message.data[1];
      var velocity = message.data[2];
      console.log("Note: " + note);
      console.log("Velocity: " + velocity);

      notes[note] = velocity;

      // Some MIDI controllers send note on with velocity 0 instead of note off
      if (velocity > 0) {
        onNoteOn(note);
      }
      else {
        noteOff();
      }
    }
    // 8 == "Note Off"
    else if (type == 8) {
      var note = message.data[1];
      notes[note] = 0;
      noteOff();
    }
  }

  function noteOff() {
    var allNotesOff = true;
    notes.forEach(function(item, index, array) {
      if (item > 0)
        allNotesOff = false;
    });

    if (allNotesOff) {
      onAllNotesOff();
    }
  }

  return {
    init: init
  };
});
