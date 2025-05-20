document.getElementById("fetch-token-btn").onclick = async () => {
  const address = document.getElementById("token-address-input").value.trim();

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    alert("Contract address ไม่ถูกต้อง");
    return;
  }

  const url = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const symbol = data.symbol.toUpperCase();
    const name = data.name;
    const decimals = 18; // อาจดึงจากอื่นถ้า Coingecko ไม่มี

    document.getElementById("token-info").innerHTML =
      `ชื่อ: ${name}<br>Symbol: ${symbol}`;

    document.getElementById("add-token-btn").style.display = "inline";
    document.getElementById("add-token-btn").onclick = async () => {
      try {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: address,
              symbol: symbol,
              decimals: decimals,
              image: data.image.thumb,
            },
          },
        });
        alert("เพิ่มสำเร็จใน Wallet แล้ว");
      } catch (err) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      }
    };
  } catch (err) {
    document.getElementById("token-info").innerText = "ไม่พบ Token นี้";
  }
};
