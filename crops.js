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
