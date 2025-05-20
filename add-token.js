document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addTokenBtn");

  if (addBtn) {
    addBtn.onclick = async () => {
      const tokenAddress = document.getElementById("fromAddress").value.trim();

      if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
        alert("กรุณาใส่ Contract Address ที่ถูกต้อง");
        return;
      }

      const tokenSymbol = prompt("สัญลักษณ์เหรียญ (เช่น USDC)");
      const tokenDecimals = parseInt(prompt("จำนวนทศนิยม (เช่น 6 หรือ 18)"), 10);
      const tokenImage = prompt("URL โลโก้เหรียญ (ไม่ใส่ก็ได้)");

      try {
        const wasAdded = await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: tokenAddress,
              symbol: tokenSymbol,
              decimals: tokenDecimals,
              image: tokenImage || "",
            },
          },
        });

        if (wasAdded) {
          alert(`✅ นำ ${tokenSymbol} เข้ากระเป๋าแล้ว`);
        } else {
          alert(`❌ ผู้ใช้ยกเลิกการเพิ่ม Token`);
        }
      } catch (error) {
        console.error("Add token error:", error);
        alert("เกิดข้อผิดพลาดในการเพิ่ม Token");
      }
    };
  }
});

