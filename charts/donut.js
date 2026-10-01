(function () {
	const panel = d3.select("#donut-chart");
	const panelElement = panel.node();

	window.chartDataPromise
		.then(({ tvEnergyAllSizesByScreenType }) => {
			const data = tvEnergyAllSizesByScreenType
				.map((row) => ({
					screenTech: row.Screen_Tech,
					energy: Number(row["Mean(Labelled energy consumption (kWh/year))"])
				}))
				.filter((row) => row.screenTech && Number.isFinite(row.energy))
				.filter((row) => row.energy > 0)
				.sort((a, b) => d3.descending(a.energy, b.energy));

			if (!panelElement || data.length === 0) return;

			const colors = d3.scaleOrdinal()
				.domain(["LCD", "LED", "OLED"])
				.range(["#39755d", "#d88c49", "#4585a3"]);
			const totalEnergy = d3.sum(data, (row) => row.energy);
			const formatEnergy = d3.format(",.1f");
			const formatPercent = d3.format(".1%");

			const draw = () => {
				const width = Math.max(260, panelElement.clientWidth - 40);
				const height = 224;
				const radius = Math.min(76, width * 0.23);
				const centerX = radius + 17;
				const centerY = height / 2 - 4;
				const arcs = d3.pie().sort(null).value((row) => row.energy)(data);
				const arc = d3.arc().innerRadius(radius * 0.58).outerRadius(radius);

				const svg = panel.selectAll("svg").data([null]).join("svg")
					.attr("viewBox", `0 0 ${width} ${height}`)
					.attr("width", "100%")
					.attr("height", height)
					.attr("role", "img")
					.attr("aria-label", "Mean annual TV energy consumption by screen technology across all sizes");

				svg.selectAll("*").remove();
				svg.append("g")
					.attr("transform", `translate(${centerX},${centerY})`)
					.selectAll("path")
					.data(arcs)
					.join("path")
					.attr("d", arc)
					.attr("fill", (slice) => colors(slice.data.screenTech))
					.attr("stroke", "#fff")
					.attr("stroke-width", 2)
					.append("title")
					.text((slice) => `${slice.data.screenTech}: ${formatEnergy(slice.data.energy)} kWh/year mean consumption`);

				const center = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);
				center.append("text")
					.attr("text-anchor", "middle")
					.attr("y", -2)
					.attr("fill", "#202a33")
					.attr("font-size", 12)
					.attr("font-weight", 700)
					.text("MEAN");
				center.append("text")
					.attr("text-anchor", "middle")
					.attr("y", 13)
					.attr("fill", "#52625a")
					.attr("font-size", 9)
					.text("kWh/year");

				const legend = svg.append("g")
					.attr("class", "donut-legend")
					.attr("transform", `translate(${width * 0.56},${centerY - (data.length * 36) / 2})`);
				const item = legend.selectAll("g")
					.data(data)
					.join("g")
					.attr("transform", (_, index) => `translate(0,${index * 36})`);

				item.append("rect")
					.attr("width", 10)
					.attr("height", 10)
					.attr("y", -9)
					.attr("rx", 2)
					.attr("fill", (row) => colors(row.screenTech));
				item.append("text")
					.attr("x", 15)
					.attr("y", 0)
					.attr("fill", "#203730")
					.attr("font-weight", 600)
					.text((row) => row.screenTech);
				item.append("text")
					.attr("x", width * 0.44 - 6)
					.attr("y", 0)
					.attr("text-anchor", "end")
					.attr("fill", "#32664f")
					.attr("font-weight", 700)
					.text((row) => formatPercent(row.energy / totalEnergy));
				item.append("text")
					.attr("x", 15)
					.attr("y", 13)
					.attr("font-size", 9)
					.text((row) => `${formatEnergy(row.energy)} kWh/year`);
			};

			draw();
			new ResizeObserver(draw).observe(panelElement);
		})
		.catch((error) => {
			console.error("Failed to render the TV energy donut chart:", error);
		});
})();