// pet-widget.js — injects the floating pet on every page
(function () {
  var PETS = {
    monkey: ['picture/monkey1.png', 'picture/monkey2.png'],
    duck:   ['picture/duck1.png',   'picture/duck2.png'],
    cat:    ['picture/cat1.png',    'picture/cat2.png']
  };

  function getProgress() {
    var stored = localStorage.getItem('tasks');
    if (!stored) return 0;
    var tasks = JSON.parse(stored);
    if (!tasks.length) return 0;
    var done = tasks.filter(function (t) { return t.completed; }).length;
    return Math.round((done / tasks.length) * 100);
  }

  function happinessInfo(pct) {
    if (pct >= 76) return { label: 'so happy!! ✨', speed: 300 };
    if (pct >= 51) return { label: 'pretty happy!', speed: 500 };
    if (pct >= 26) return { label: 'doing okay',   speed: 800 };
    return             { label: 'feeling blue...', speed: 1200 };
  }

  var activeInterval = null;

  // called by renderer.js after tasks change on the same page
  function refreshWidget() {
    var petName = localStorage.getItem('boji-pet') || 'cat';
    var frames  = PETS[petName] || PETS.cat;
    var pct     = getProgress();
    var info    = happinessInfo(pct);

    var img   = document.getElementById('pet-sprite');
    var label = document.getElementById('pet-label');
    if (!img || !label) return;

    if (activeInterval) { clearInterval(activeInterval); activeInterval = null; }

    img.alt = petName;
    label.textContent = info.label;

    var frame = 0;
    img.src = frames[0];
    activeInterval = setInterval(function () {
      frame = 1 - frame;
      img.src = frames[frame];
    }, info.speed);
  }

  function buildWidget() {
    var petName = localStorage.getItem('boji-pet') || 'cat';
    var frames  = PETS[petName] || PETS.cat;
    var pct     = getProgress();
    var info    = happinessInfo(pct);

    var wrapper = document.createElement('div');
    wrapper.id  = 'pet-widget';

    var img = document.createElement('img');
    img.src = frames[0];
    img.id  = 'pet-sprite';
    img.alt = petName;

    var label = document.createElement('div');
    label.id  = 'pet-label';
    label.textContent = info.label;

    var link = document.createElement('a');
    link.href  = 'pet-page.html';
    link.title = 'visit your pet';
    link.style.display = 'flex';
    link.style.flexDirection = 'column';
    link.style.alignItems = 'center';
    link.style.textDecoration = 'none';
    link.appendChild(img);
    link.appendChild(label);
    wrapper.appendChild(link);
    document.body.appendChild(wrapper);

    // start animation
    if (activeInterval) clearInterval(activeInterval);
    var frame = 0;
    activeInterval = setInterval(function () {
      frame = 1 - frame;
      img.src = frames[frame];
    }, info.speed);

    // refresh if tasks/pet change in another tab
    window.addEventListener('storage', function (e) {
      if (e.key === 'tasks' || e.key === 'boji-pet') {
        if (activeInterval) { clearInterval(activeInterval); activeInterval = null; }
        var existing = document.getElementById('pet-widget');
        if (existing) existing.remove();
        buildWidget();
      }
    });
  }

  // expose for same-page refresh (called by renderer.js)
  window.bojiPetRefresh = refreshWidget;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
