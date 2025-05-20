async function fetchCryptoData() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=polygon,ethereum,bitcoin";

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const cryptoList = document.getElementById("crypto-list");
    cryptoList.innerHTML = "";

    data.forEach(coin => {
      const card = document.createElement("div");
      card.className = "crypto-card";

      card.innerHTML = `
        <img class="crypto-img" src="${coin.image}" alt="${coin.name}">
        <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
        <p class="price">💰 $${coin.current_price}</p>
      `;
      
      cryptoList.appendChild(card);
    });

  } catch (error) {
    console.error("❌ ดึงราคาล้มเหลว:", error);
    document.getElementById("crypto-list").innerHTML = "<p>⛔ ไม่สามารถโหลดข้อมูล</p>";
  }
}

// โหลดข้อมูลเมื่อเปิดเว็บ
window.onload = fetchCryptoData;
