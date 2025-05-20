async function loadTopTokens() {
  const coingeckoAPI = 'https://your-proxy.vercel.app/api/coingecko';
  const fallbackJSON = 'token-list.json';

  try {
    const res = await fetch(coingeckoAPI);
    if (!res.ok) throw new Error("Proxy API failed");
    const data = await res.json();
    renderTokenList(data);
  } catch (err) {
    console.warn("❌ โหลดจาก Coingecko ไม่ได้:", err);
    const fallback = await fetch(fallbackJSON);
    const tokens = await fallback.json();
    renderTokenList(tokens);
  }
}

function renderTokenList(tokens) {
  const fromToken = document.getElementById('fromToken');
  const toToken = document.getElementById('toToken');
  if (!fromToken || !toToken) return;

  fromToken.innerHTML = '';
  toToken.innerHTML = '';
  tokens.forEach(token => {
    const opt1 = document.createElement('option');
    opt1.value = token.address;
    opt1.textContent = `${token.symbol} (${token.name})`;
    fromToken.appendChild(opt1);

    const opt2 = opt1.cloneNode(true);
    toToken.appendChild(opt2);
  });

  document.getElementById('crypto-list').textContent = `✅ โหลด ${tokens.length} เหรียญแล้ว`;
}

document.addEventListener('DOMContentLoaded', loadTopTokens);
