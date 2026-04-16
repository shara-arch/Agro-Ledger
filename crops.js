//Load data 
//File paths
const cropsFile = "data/crops.json";
const supplyFile = "data/supply.json";

//Load data
async function loadData() {
    try{
    const cropsRes = await fetch(cropsFile);
    const cropsData = await cropsRes.json();
    const supplyRes = await fetch(supplyFile);
    const supplyData = await supplyRes.json();
    const crops = cropsData.crops || [];
    const supply = supplyData.supply || [];
    return { crops, supply };
        // crops: cropsData.crops,
        // supply: supplyData.supply
    
}catch (err){
     console.error("Error loading data", err);
        return { crops: [], supply: [] }; // fallback
}
}
//renderCrops
async function renderCrops() {
    try {
        const { crops } = await loadData();
        const container = document.querySelector("#cropsList");
    if (!container) {
      console.error("Container #cropsList not found");
      return;
    }

    container.innerHTML="";

    if (!crops || crops.length === 0) {
      container.textContent = "No crops found.";
      return;
    }

    crops.forEach(crop =>{
        const card = document.createElement("div");
        card.classList.add("recent-crop-card");

        card.innerHTML = `${crop.name} -- ${crop.type} -- ${crop.qty} kg --  ${crop.stage} -- (${crop.harvestDate}) -- <button> Edit</button   <button> Del</button>`;
        container.appendChild(card);
    })
  } catch(err){
    console.error("Error found trying to renderCrops", err)
  }
}
renderCrops();

async function renderSupply() {
    try {
        const { supply } = await loadData();
        const container = document.querySelector("#supplyList")
    if (!container) {
      console.error("Container #supplyList not found");
      return;
    }

    container.innerHTML="";

    if (!supply || supply.length === 0) {
      container.textContent = "No supply found.";
      return;
    }


    supply.forEach(item => {
         if (!item.name) return; // skip invalid entries

        const supplyStatus = item.stock > item.minLevel ? "In Stock" : "Low stock";
        const card = document.createElement("div");
        card.classList.add("supply-status-card");

        card.innerHTML = `<p>${item.name} -- (${item.notes}) ---- ${item.category} --- ${item.stock} --- ${item.unit} --- ${item.minLevel} --- ${supplyStatus}  <button> Edit </button ---  <button> Del </button> </p>`;
        container.appendChild(card);
    });
    } catch(err){
        console.error(`Error rendering Supply Status`, err);
    }
}
renderSupply();