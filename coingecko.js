async function loadTopTokens() {
  const tokenListEl = document.getElementById("token-list");
  const proxyUrl = "https://dex-coingecko-proxy.vercel.app/api/markets";
  const fallbackUrl = "https://kittiengchon.github.io/dex-tools-site/token-list.json";

  try {
    // ลองโหลดจาก Proxy API ก่อน
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("Proxy API Failed");
    const data = await res.json();

    renderTokenList(data, tokenListEl);
  } catch (error) {
    console.warn("โหลดจาก Proxy API ไม่ได้ → ใช้ fallback จาก token-list.json แทน", error);

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

  tokens.forEach((token) => {
    const item = document.createElement("div");
    item.className = "token-item";
    item.innerHTML = `
      <strong>${token.symbol}</strong> - ${token.name}<br>
      Address: <code>${token.address}</code>
    `;
    container.appendChild(item);
  });
}

// โหลดเมื่อหน้าเว็บพร้อม
document.addEventListener("DOMContentLoaded", loadTopTokens);
