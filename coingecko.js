const COINGECKO_PROXY_URL = 'https://dex-coingecko-proxy.vercel.app/api/coingecko';
const TOKEN_LIST_FALLBACK = 'https://kittiengchon.github.io/dex-tools-site/token-list.json';

async function loadTopTokens() {
  let tokens = [];

  try {
    const res = await fetch(COINGECKO_PROXY_URL);
    if (!res.ok) throw new Error('Proxy failed');
    tokens = await res.json();
    console.log('✅ Loaded from Coingecko Proxy:', tokens);
  } catch (err) {
    console.warn('⚠️ Fallback to token-list.json due to:', err.message);
    try {
      const fallbackRes = await fetch(TOKEN_LIST_FALLBACK);
      if (!fallbackRes.ok) throw new Error('Fallback failed');
      tokens = await fallbackRes.json();
      console.log('✅ Loaded from token-list.json:', tokens);
    } catch (fallbackErr) {
      console.error('❌ Failed to load both sources:', fallbackErr.message);
    }
  }

  renderTokenList(tokens);
}

function renderTokenList(tokens) {
  const list = document.getElementById('token-list');
  if (!list) return;

  list.innerHTML = '';
  tokens.forEach(token => {
    const item = document.createElement('li');
    item.textContent = `${token.symbol.toUpperCase()} (${token.name})`;
    list.appendChild(item);
  });
}

// เรียกโหลดเมื่อ DOM พร้อม
document.addEventListener('DOMContentLoaded', loadTopTokens);
