# Create updated coingecko.js to use the new token-list-pol.json as fallback

coingecko_js_updated = """
async function loadTopTokens() {
  const tokenListEl = document.getElementById("token-list");
  const proxyUrl = "https://dex-coingecko-proxy.vercel.app/";
  const fallbackUrl = "https://kittiengchon.github.io/dex-tools-site/token-list-pol.json"; // ใช้ POL แทน MATIC

  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("Proxy API Failed");
    const data = await res.json();
    renderTokenList(data, tokenListEl);
  } catch (error) {
    console.warn("โหลดจาก Proxy API ไม่ได้ → ใช้ fallback จาก token-list-pol.json แทน", error);
    try {
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      renderTokenList(fallbackData, tokenListEl);
    } catch (fallbackError) {
      console.error("โหลด fallback ก็ล้มเหลว:", fallbackError);
      tokenListEl.innerHTML = "<p>ไม่สามารถโหลดข้อมูลเหรียญได้ในขณะนี้</p>";
    }
  }
}

function renderTokenList(tokens, container) {
  if (!Array.isArray(tokens)) return;
  container.innerHTML = "";

  // ✅ ให้ tokenList ใช้งานได้ global
  window.tokenList = tokens;

  const fromSelect = document.getElementById("fromToken");
  const toSelect = document.getElementById("toToken");

  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";

  tokens.forEach((token) => {
    const item = document.createElement("div");
    item.className = "token-item";
    item.innerHTML = `
      <strong>${token.symbol}</strong> - ${token.name}<br>
      Address: <code>${token.address}</code>
    `;
    container.appendChild(item);

    const option1 = document.createElement("option");
    option1.value = token.address;
    option1.textContent = `${token.symbol}`;
    fromSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = token.address;
    option2.textContent = `${token.symbol}`;
    toSelect.appendChild(option2);
  });
}

document.addEventListener("DOMContentLoaded", loadTopTokens);
"""

# Save to file
coingecko_updated_path = "/mnt/data/coingecko.js"
with open(coingecko_updated_path, "w", encoding="utf-8") as f:
    f.write(coingecko_js_updated)

coingecko_updated_path
