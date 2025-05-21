async function loadTopTokens() {
  const tokenListEl = document.getElementById("token-list");
  const proxyUrl = "https://dex-coingecko-proxy.vercel.app/";
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

  // ✅ ให้ tokenList ใช้งานได้ใน global scope เช่นใน swap()
  window.tokenList = tokens;

  // ดึง select element ของเหรียญ
  const fromSelect = document.getElementById("fromToken");
  const toSelect = document.getElementById("toToken");

  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";

  tokens.forEach((token) => {
    // แสดงรายการเหรียญใน token-list
    const item = document.createElement("div");
    item.className = "token-item";
    item.innerHTML = `
      <strong>${token.symbol}</strong> - ${token.name}<br>
      Address: <code>${token.address}</code>
    `;
    container.appendChild(item);

    // เพิ่มใน dropdown
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

// โหลดเมื่อ DOM พร้อม
document.addEventListener("DOMContentLoaded", loadTopTokens);


