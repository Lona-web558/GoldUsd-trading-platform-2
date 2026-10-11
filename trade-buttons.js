(function () {
  const $ = id => document.getElementById(id);

  /* ---- Price source ----
     Standalone: a simulated price. On your chart page, define this BEFORE
     loading this file so the buttons use the chart's latest close:
       window.getLastPrice = () => DATA[DATA.length - 1].close;           */
  const external = typeof window.getLastPrice === 'function';
  let demoPrice = 3300;
  if (!external) window.getLastPrice = () => demoPrice;

  let pos = null;      // { dir: 1 | -1, entry, qty }
  let closedPnl = 0;

  const money = v => (v >= 0 ? '+$' : '-$') + Math.abs(v).toFixed(2);
  const qty   = () => Math.max(1, parseFloat($('qty').value) || 1);

  function log(text, value) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${text}</span><span class="${value >= 0 ? 'profit' : 'loss'}">${value == null ? '' : money(value)}</span>`;
    $('history').prepend(li);
  }

  function render() {
    const price = window.getLastPrice();
    $('price').textContent = price.toFixed(2);
    const open = pos ? (price - pos.entry) * pos.dir * pos.qty : 0;
    const total = closedPnl + open;
    $('pos-txt').textContent = pos
      ? `${pos.dir > 0 ? 'LONG' : 'SHORT'} ${pos.qty} oz @ ${pos.entry.toFixed(2)}`
      : 'None';
    const el = $('pnl');
    el.textContent = money(total);
    el.className = total >= 0 ? 'profit' : 'loss';
  }

  function closePosition() {
    if (!pos) return;
    const price = window.getLastPrice();
    const result = (price - pos.entry) * pos.dir * pos.qty;
    closedPnl += result;
    log(`Close ${pos.dir > 0 ? 'LONG' : 'SHORT'} @ ${price.toFixed(2)}`, result);
    if (window.onTrade) window.onTrade({ action: 'close', price, dir: pos.dir });
    pos = null;
    render();
  }

  function trade(dir) {
    if (pos && pos.dir === dir) return;     // already in this direction
    closePosition();                        // flip if opposite
    const price = window.getLastPrice();
    pos = { dir, entry: price, qty: qty() };
    log(`${dir > 0 ? 'BUY' : 'SELL'} ${pos.qty} oz @ ${price.toFixed(2)}`, null);
    if (window.onTrade) window.onTrade({ action: dir > 0 ? 'buy' : 'sell', price, dir });
    render();
  }

  $('btn-buy').addEventListener('click', () => trade(1));
  $('btn-sell').addEventListener('click', () => trade(-1));
  $('btn-close').addEventListener('click', closePosition);

  setInterval(() => {
    if (!external) demoPrice += (Math.random() - 0.5) * 1.2;
    render();
  }, 1000);
  render();
})();
