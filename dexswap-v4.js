let provider, signer, account;

const chainInfo = {
  polygon: { chainId: 137, api: "https://polygon.api.0x.org" },
  bsc: { chainId: 56, api: "https://bsc.api.0x.org" },
  arbitrum: { chainId: 42161, api: "https://arbitrum.api.0x.org" },
  base: { chainId: 8453, api: "https://base.api.0x.org" }
};

document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectButton");
  const swapBtn = document.getElementById("swapButton");
  const fromToken = document.getElementById("fromToken");
  const toToken = document.getElementById("toToken");
  const fromCustom = document.getElementById("fromCustom");
  const toCustom = document.getElementById("toCustom");

  fromToken.addEventListener("change", () => {
    fromCustom.style.display = fromToken.value === "CUSTOM" ? "inline-block" : "none";
  });

  toToken.addEventListener("change", () => {
    toCustom.style.display = toToken.value === "CUSTOM" ? "inline-block" : "none";
  });

  connectBtn.onclick = async () => {
    if (window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      account = await signer.getAddress();
      connectBtn.textContent = `Connected: ${account.slice(0, 6)}...`;
    } else {
      alert("MetaMask not found");
    }
  };

  swapBtn.onclick = async () => {
    const chain = document.getElementById("chainSelect").value;
    const { api } = chainInfo[chain];

    const from = fromToken.value === "CUSTOM" ? fromCustom.value : fromToken.value;
    const to = toToken.value === "CUSTOM" ? toCustom.value : toToken.value;
    const amount = document.getElementById("amount").value;
    const estimateEl = document.getElementById("estimate");

    if (!account || !from || !to || !amount) {
      alert("Fill all fields and connect wallet");
      return;
    }

    try {
      const sellAmount = ethers.utils.parseUnits(amount, 18).toString();
      const res = await fetch(`${api}/swap/v1/quote?buyToken=${to}&sellToken=${from}&sellAmount=${sellAmount}&sender=${account}`);
      const quote = await res.json();

      estimateEl.textContent = `You will get ≈ ${quote.buyAmount / 1e18} ${to} (Gas ≈ ${quote.estimatedGas})`;

      const tx = {
        to: quote.to,
        data: quote.data,
        value: ethers.BigNumber.from(quote.value || "0")
      };

      const result = await signer.sendTransaction(tx);
      console.log("Swap TX:", result.hash);
      alert("Swap sent! Tx Hash: " + result.hash);
    } catch (err) {
      console.error(err);
      alert("Swap failed: " + err.message);
    }
  };
});
