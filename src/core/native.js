/* Android app (Capacitor) integration: back button, status bar, app pause, share links */
(function () {
  const IR = (window.IR = window.IR || {});
  const C = window.Capacitor;
  IR.NATIVE = !!(C && C.isNativePlatform && C.isNativePlatform());
  // challenge links must point to the public website, not the app's internal localhost
  const PUBLIC = 'https://ssharma3980-ux.github.io/india-run/';
  IR.SHARE_BASE = IR.NATIVE || /itch\.(zone|io)$/.test(location.hostname) ? PUBLIC : null;
  if (!IR.NATIVE) return;
  const P = C.Plugins || {};
  window.addEventListener('load', () => {
    try { P.StatusBar && P.StatusBar.hide(); } catch (e) {}
    try { P.SplashScreen && P.SplashScreen.hide(); } catch (e) {}
  });
  if (P.App) {
    P.App.addListener('backButton', () => {
      const g = window.game, ui = IR.ui;
      if (!g || !ui) return;
      if (g.state === 'playing') return g.pause();
      if (g.state === 'paused') return g.resume();
      if (ui.stack && ui.stack.length) return ui.back();
      const open = [...document.querySelectorAll('.screen.on')].filter((s) => s.id !== 'menu');
      if (open.length && g.state !== 'menu' && g.state !== 'select') return g.toMenu();
      if (open.length) { open.forEach((s) => s.classList.remove('on')); ui.toMenu(); return; }
      P.App.exitApp();
    });
    P.App.addListener('pause', () => { const g = window.game; if (g && g.state === 'playing') g.pause(); });
  }
})();
