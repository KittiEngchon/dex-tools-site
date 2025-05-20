document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const walletAddressEl = document.getElementById("wallet-address");

  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      try {
        if (typeof window.ethereum === "undefined") {
          alert("กรุณาติดตั้ง MetaMask");
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        walletAddressEl.innerText = `🔗 ${address}`;
        connectBtn.innerText = "✅ Connected";
      } catch (error) {
        console.error("Connect Wallet Error:", error);
        alert("เกิดปัญหาในการเชื่อม Wallet");
      }
    });
  }
});
