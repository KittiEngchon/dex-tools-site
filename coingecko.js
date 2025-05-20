// coingecko.js

async function loadTopTokens() {
  const fromSelect = document.getElementById("fromToken");
  const toSelect = document.getElementById("toToken");

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=10&page=1");
    const tokens = await res.json();

    document.getElementById("crypto-list").innerText = "✅ โหลดเหรียญยอดนิยมแล้ว";

    tokens.forEach(token => {
      const opt1 = document.createElement("option");
      opt1.value = token.symbol.toUpperCase();
      opt1.text = `${token.name} (${token.symbol.toUpperCase()})`;
      fromSelect.appendChild(opt1);

      const opt2 = opt1.cloneNode(true);
      toSelect.appendChild(opt2);
    });

  } catch (err) {
    document.getElementById("crypto-list").innerText = "❌ โหลดเหรียญล้มเหลว";
  }
}

document.addEventListener("DOMContentLoaded", loadTopTokens);
