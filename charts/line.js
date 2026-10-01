(function () {
	const panel = d3.select("#line-chart");
	const panelElement = panel.node();

	window.chartDataPromise
		.then(({ spotPrices }) => {
			const data = spotPrices
				.map((row) => ({
					year: Number(row.Year),
					price: Number(row["Average Price (notTas-Snowy)"])
				}))
				.filter((row) => Number.isFinite(row.year) && Number.isFinite(row.price))
				.filter((row) => row.year >= 1998 && row.year <= 2024)
				.sort((a, b) => d3.ascending(a.year, b.year));

			if (!panelElement || data.length === 0) return;

			const draw = () => {
				const width = Math.max(260, panelElement.clientWidth - 40);
				const height = 224;
				const margin = { top: 10, right: 14, bottom: 44, left: 52 };
				const x = d3.scaleLinear()
					.domain(d3.extent(data, (row) => row.year))
					.range([margin.left, width - margin.right]);
				const y = d3.scaleLinear()
					.domain(d3.extent(data, (row) => row.price))
					.nice()
					.range([height - margin.bottom, margin.top]);
				const line = d3.line()
					.x((row) => x(row.year))
					.y((row) => y(row.price));

				const svg = panel.selectAll("svg").data([null]).join("svg")
					.attr("viewBox", `0 0 ${width} ${height}`)
					.attr("width", "100%")
					.attr("height", height)
					.attr("role", "img")
					.attr("aria-label", "Annual average spot power prices from 1998 to 2024");

				svg.selectAll("*").remove();
				svg.append("g")
					.attr("class", "line-axis line-axis-x")
					.attr("transform", `translate(0,${height - margin.bottom})`)
					.call(d3.axisBottom(x)
						.tickValues([1998, 2003, 2008, 2013, 2018, 2024])
						.tickFormat(d3.format("d")))
					.call((axis) => axis.select(".domain").remove());
				svg.append("g")
					.attr("class", "line-axis")
					.attr("transform", `translate(${margin.left},0)`)
					.call(d3.axisLeft(y).ticks(5).tickSize(-(width - margin.left - margin.right)))
					.call((axis) => axis.select(".domain").remove());

				svg.append("path")
					.datum(data)
					.attr("fill", "none")
					.attr("stroke", "#c96f4c")
					.attr("stroke-width", 2.5)
					.attr("stroke-linejoin", "round")
					.attr("stroke-linecap", "round")
					.attr("d", line);

				svg.append("g")
					.selectAll("circle")
					.data(data)
					.join("circle")
					.attr("cx", (row) => x(row.year))
					.attr("cy", (row) => y(row.price))
					.attr("r", 2.5)
					.attr("fill", "#c96f4c")
					.append("title")
					.text((row) => `${row.year}: $${d3.format(",.2f")(row.price)} per MWh`);

				svg.append("text")
					.attr("x", (margin.left + width - margin.right) / 2)
					.attr("y", height - 4)
					.attr("text-anchor", "middle")
					.attr("fill", "#52625a")
					.attr("font-size", 11)
					.text("Year");
				svg.append("text")
					.attr("transform", "rotate(-90)")
					.attr("x", -(margin.top + height - margin.bottom) / 2)
					.attr("y", 12)
					.attr("text-anchor", "middle")
					.attr("fill", "#52625a")
					.attr("font-size", 11)
					.text("Average price ($/MWh)");
			};

			draw();
			new ResizeObserver(draw).observe(panelElement);
		})
		.catch((error) => {
			console.error("Failed to render the spot-price line chart:", error);
		});
})();