(function () {
	const panel = d3.select("#bar-chart");
	const panelElement = panel.node();

	window.chartDataPromise
		.then(({ tvEnergy55InchByScreenType }) => {
			const data = tvEnergy55InchByScreenType
				.map((row) => ({
					screenTech: row.Screen_Tech,
					energy: Number(row["Mean(Labelled energy consumption (kWh/year))"])
				}))
				.filter((row) => row.screenTech && Number.isFinite(row.energy));

			if (!panelElement || data.length === 0) return;
			const colors = d3.scaleOrdinal()
				.domain(["LCD", "LED", "OLED"])
				.range(["#39755d", "#d88c49", "#4585a3"]);

			const draw = () => {
				const width = Math.max(260, panelElement.clientWidth - 40);
				const height = 224;
				const margin = { top: 8, right: 14, bottom: 44, left: 54 };
				const x = d3.scaleLinear()
					.domain([0, d3.max(data, (row) => row.energy)])
					.nice()
					.range([margin.left, width - margin.right]);
				const y = d3.scaleBand()
					.domain(data.map((row) => row.screenTech))
					.range([margin.top, height - margin.bottom])
					.padding(0.25);

				const svg = panel.selectAll("svg").data([null]).join("svg")
					.attr("viewBox", `0 0 ${width} ${height}`)
					.attr("width", "100%")
					.attr("height", height)
					.attr("role", "img")
					.attr("aria-label", "Mean annual energy consumption by screen technology");

				svg.selectAll("*").remove();
				svg.append("g")
					.attr("class", "bar-axis bar-axis-x")
					.attr("transform", `translate(0,${height - margin.bottom})`)
					.call(d3.axisBottom(x)
						.ticks(4)
						.tickSize(-(height - margin.top - margin.bottom))
						.tickFormat(d3.format("~s")))
					.call((axis) => axis.select(".domain").remove());

				svg.append("g")
					.attr("class", "bar-axis")
					.attr("transform", `translate(${margin.left},0)`)
					.call(d3.axisLeft(y).tickSize(0))
					.call((axis) => axis.select(".domain").remove());

				svg.append("g")
					.selectAll("rect")
					.data(data)
					.join("rect")
					.attr("x", x(0))
					.attr("y", (row) => y(row.screenTech))
					.attr("width", (row) => x(row.energy) - x(0))
					.attr("height", y.bandwidth())
					.attr("rx", 2)
					.attr("fill", (row) => colors(row.screenTech));

				svg.append("text")
					.attr("x", (margin.left + width - margin.right) / 2)
					.attr("y", height - 4)
					.attr("text-anchor", "middle")
					.attr("fill", "#52625a")
					.attr("font-size", 11)
					.text("Mean energy consumption (kWh/year)");
			};

			draw();
			new ResizeObserver(draw).observe(panelElement);
		})
		.catch((error) => {
			console.error("Failed to render the TV energy bar chart:", error);
		});
})();