const dataFiles = {
	spotPrices: "data/Ex5_ARE_Spot_Prices.csv",
	tvEnergy: "data/Ex5_TV_energy.csv",
	tvEnergy55InchByScreenType: "data/Ex5_TV_energy_55inchtv_byScreenType.csv",
	tvEnergyAllSizesByScreenType: "data/Ex5_TV_energy_Allsizes_byScreenType.csv"
};

Promise.all(
	Object.entries(dataFiles).map(async ([name, path]) => [name, await d3.csv(path)])
)
	.then((datasets) => {
		window.energyData = Object.fromEntries(datasets);
	})
	.catch((error) => {
		console.error("Failed to load energy datasets:", error);
	});const datasets = {
  spotPrices: "data/Ex5_ARE_Spot_Prices.csv",
  tvEnergy: "data/Ex5_TV_energy.csv",
  tvEnergy55InchByScreenType: "data/Ex5_TV_energy_55inchtv_byScreenType.csv",
  tvEnergyAllSizesByScreenType: "data/Ex5_TV_energy_Allsizes_byScreenType.csv"
};

window.chartDataPromise = Promise.all(
  Object.entries(datasets).map(async ([name, path]) => [name, await d3.csv(path)])
)
  .then((loadedDatasets) => {
    window.chartData = Object.fromEntries(loadedDatasets);
    return window.chartData;
  })
  .catch((error) => {
    console.error("Failed to load chart data:", error);
    throw error;
  });