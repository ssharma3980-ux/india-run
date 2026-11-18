/* Boot */
(function () {
  const bar = document.querySelector('#loading .bar i');
  const game = (window.game = new IR.Game(document.getElementById('c')));
  game.init((k) => { bar.style.width = Math.round(k * 100) + '%'; }).then(() => {
    IR.ui.build(game);
    game.snapCamera();
    setTimeout(() => { const l = document.getElementById('loading'); l.classList.add('hide'); setTimeout(() => (l.style.display = 'none'), 900); }, 250);
  }).catch((e) => {
    console.error(e);
    document.querySelector('#loading small').textContent = 'Error: ' + e.message + ' — your browser needs WebGL.';
  });
})();
