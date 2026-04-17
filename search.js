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
async function performSearch() {
    try{
        const { crops } = await loadData();
        const { supply } = await loadData();
        const query = document.getElementById("search-input").value.toLowercase();
        const checkCrops = document.getElementById("filter-crops").checked;
        const checkSupply = document.getElementById("filter-supplies").checked;
        const resultContainer = document.getElementById("search-results");

        resultContainer.innerHTML=""
        let results = [];
        //Search crops if checkbox is checked
        if(checkCrops){
            const cropMatches = crops.filter(crop => 
                crop.name.toLowercase().includes(query)
            );
            results.push(...cropMatches.map(c =>({...c, category:"Crop"})));
        }
        //Search supply if checkbox is checked
        if(checkSupply){
            const supplyMatches = supply.filter(supply => 
                supply.name.toLowercase().includes(query)
            );
            results.push(...supplyMatches.map(c =>({...c, category:"Supply"})))
        }
        //No results found 
        if(results.length === 0) {
            resultContainer.textContent = "No matching items found.";
            return;
        }
        //Display results
        results.forEach(item =>{
            const div = document.createElement("div");
            div.classList.add('resultcard');
            div.innerHTML = `<h3>${item.name}</h3>
            <p>
            ${item.type ?`<span>${item.type} • </span>` : ""}
            ${item.qty ?`<span>${item.qty} • </span>` : ""}
            ${item.stage ?`<span>Stage: ${item.stage} • </span>` : ""}
            ${item.harvestDate ?`<span>Harvest:${item.harvestDate} • </span>` : ""}
            ${item.category ?`<span>Category: ${item.category} • </span>` : ""}
            ${item.stock ?`<span>Stock: ${item.stock} • </span>` : ""}
            ${item.minLevel ?`<span>Minimum Level: ${item.minLevel} • </span>` : ""}
            
            </p>`;
            resultContainer.appendChild(div);
        })
    } catch(err){
        console.error("Error performing search for crops/supply:", err);
    }

}