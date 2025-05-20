// add-token.js
document.addEventListener("DOMContentLoaded", function () {
  const fetchBtn = document.getElementById("fetch-token-btn");
  const addBtn = document.getElementById("add-token-btn");
  const tokenInfoDiv = document.getElementById("token-info");

  fetchBtn.onclick = async () => {
    const address = document.getElementById("token-address-input").value.trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      alert("ที่อยู่ Contract ไม่ถูกต้อง");
      return;
    }

    const url = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`;
    tokenInfoDiv.innerHTML = "⏳ กำลังดึงข้อมูล...";

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("ไม่พบ Token บน CoinGecko");
      const data = await res.json();

      const symbol = data.symbol.toUpperCase();
      const name = data.name;
      const image = data.image?.thumb || "";
      const decimals = 18; // fallback ถ้าไม่มีใน response

      tokenInfoDiv.innerHTML = `
        <p><strong>${name} (${symbol})</strong></p>
        <img src="${image}" alt="logo" style="width:32px;height:32px;">
      `;

      addBtn.style.display = "inline-block";
      addBtn.onclick = async () => {
        try {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address,
                symbol,
                decimals,
                image
              }
            }
          });
        } catch (err) {
          alert("เพิ่ม Token ไม่สำเร็จ: " + err.message);
        }
      };

    } catch (err) {
      tokenInfoDiv.innerHTML = `<span style='color: pink;'>❌ ${err.message}</span>`;
      addBtn.style.display = "none";
    }
  };
});
