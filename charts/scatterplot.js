(function () {
	const panel = d3.select("#scatter-chart");
	const panelElement = panel.node();

	window.chartDataPromise
		.then(({ tvEnergy }) => {
			const data = tvEnergy
				.map((row) => ({
					brand: row.brand,
					screenTech: row.screen_tech,
					screenSize: Number(row.screensize),
					energy: Number(row.energy_consumpt),
					starRating: Number(row.star2),
					count: Number(row.count)
				}))
				.filter((row) => Number.isFinite(row.energy) && Number.isFinite(row.starRating));

			if (!panelElement || data.length === 0) return;

			const draw = () => {
				const width = Math.max(260, panelElement.clientWidth - 40);
				const height = 224;
				const margin = { top: 10, right: 14, bottom: 44, left: 48 };
				const x = d3.scaleLinear()
					.domain(d3.extent(data, (row) => row.energy))
					.nice()
					.range([margin.left, width - margin.right]);
				const y = d3.scaleLinear()
					.domain(d3.extent(data, (row) => row.starRating))
					.nice()
					.range([height - margin.bottom, margin.top]);

				const svg = panel.selectAll("svg").data([null]).join("svg")
					.attr("viewBox", `0 0 ${width} ${height}`)
					.attr("width", "100%")
					.attr("height", height)
					.attr("role", "img")
					.attr("aria-label", "TV energy consumption compared with star rating");

				svg.selectAll("*").remove();
				svg.append("g")
					.attr("class", "scatter-axis scatter-axis-x")
					.attr("transform", `translate(0,${height - margin.bottom})`)
					.call(d3.axisBottom(x)
						.ticks(5)
						.tickSize(-(height - margin.top - margin.bottom)))
					.call((axis) => axis.select(".domain").remove());

				svg.append("g")
					.attr("class", "scatter-axis")
					.attr("transform", `translate(${margin.left},0)`)
					.call(d3.axisLeft(y).ticks(5).tickSize(0))
					.call((axis) => axis.select(".domain").remove());

				svg.append("g")
					.selectAll("circle")
					.data(data)
					.join("circle")
					.attr("cx", (row) => x(row.energy))
					.attr("cy", (row) => y(row.starRating))
					.attr("r", 3)
					.attr("fill", "#438ba0")
					.attr("fill-opacity", 0.55)
					.append("title")
					.text((row) => `${row.brand} | ${row.screenTech}, ${row.screenSize} in | ${row.energy} kWh/year | ${row.starRating} stars`);

				svg.append("text")
					.attr("x", (margin.left + width - margin.right) / 2)
					.attr("y", height - 4)
					.attr("text-anchor", "middle")
					.attr("fill", "#52625a")
					.attr("font-size", 11)
					.text("Energy consumption (kWh/year)");

				svg.append("text")
					.attr("transform", "rotate(-90)")
					.attr("x", -(margin.top + height - margin.bottom) / 2)
					.attr("y", 12)
					.attr("text-anchor", "middle")
					.attr("fill", "#52625a")
					.attr("font-size", 11)
					.text("Star rating");
			};

			draw();
			new ResizeObserver(draw).observe(panelElement);
		})
		.catch((error) => {
			console.error("Failed to render the TV energy scatterplot:", error);
		});
})();