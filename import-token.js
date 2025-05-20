// import-token.js

// ดึง token ที่เคยเพิ่มจาก LocalStorage
function loadCustomTokens(chain) {
  const stored = localStorage.getItem(`customTokens-${chain}`);
  return stored ? JSON.parse(stored) : [];
}

// บันทึก token ใหม่
function saveCustomToken(chain, token) {
  const tokens = loadCustomTokens(chain);
  const exists = tokens.find(t => t.address.toLowerCase() === token.address.toLowerCase());
  if (!exists) {
    tokens.push(token);
    localStorage.setItem(`customTokens-${chain}`, JSON.stringify(tokens));
  }
}

// UI แสดงเหรียญที่เคยเพิ่ม
function renderCustomTokens(chain, selectElementId) {
  const tokens = loadCustomTokens(chain);
  const select = document.getElementById(selectElementId);
  tokens.forEach(token => {
    const option = document.createElement('option');
    option.value = token.address;
    option.text = `${token.symbol} (${token.name})`;
    select.appendChild(option);
  });
}

// ดึงข้อมูล token จาก contract
async function fetchTokenDetails(address, provider) {
  const abi = ["function name() view returns (string)", "function symbol() view returns (string)", "function decimals() view returns (uint8)"];
  const contract = new ethers.Contract(address, abi, provider);
  const [name, symbol, decimals] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals()
  ]);
  return { address, name, symbol, decimals };
}

// เพิ่ม token เมื่อผู้ใช้วาง address แล้ว blur field
async function handleAddTokenInput(inputId, chain, selectId) {
  const input = document.getElementById(inputId);
  input.addEventListener('blur', async () => {
    const address = input.value.trim();
    if (!ethers.utils.isAddress(address)) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const token = await fetchTokenDetails(address, provider);
      saveCustomToken(chain, token);
      const select = document.getElementById(selectId);
      const option = document.createElement('option');
      option.value = token.address;
      option.text = `${token.symbol} (${token.name})`;
      select.appendChild(option);
    } catch (err) {
      console.error("ไม่สามารถดึงข้อมูล token ได้:", err);
    }
  });
}
