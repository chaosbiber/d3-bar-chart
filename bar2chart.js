function errorBarClosure(xScale, yScale) {
    var errorBar = function (d) {
        let g = d3.select(this).selectAll('.bar-group').data([d]).enter();
        // error bars
        g.append('line')
        .attr('class', 'error-line')
        .attr('x1', (d) => xScale(d.name) + xScale.bandwidth() / 2)
        .attr('x2', (d) => xScale(d.name) + xScale.bandwidth() / 2)
        .attr('y1', (d) => yScale(d.value - d.error))
        .attr('y2', (d) => yScale(d.value + d.error));
        // error caps
        g.append('line')
        .attr('class', 'error-cap')
        .attr('x1', (d) => xScale(d.name) + xScale.bandwidth() / 3)
        .attr('x2', (d) => xScale(d.name) + xScale.bandwidth() / 3 * 2)
        .attr('y1', (d) => yScale(d.value - d.error))
        .attr('y2', (d) => yScale(d.value - d.error));
        g.append('line')
        .attr('class', 'error-cap')
        .attr('x1', (d) => xScale(d.name) + xScale.bandwidth() / 3)
        .attr('x2', (d) => xScale(d.name) + xScale.bandwidth() / 3 * 2)
        .attr('y1', (d) => yScale(d.value + d.error))
        .attr('y2', (d) => yScale(d.value + d.error));
    }
    return errorBar;
}

/**
 * draws a bar chart with error bars
 *
 * @param {data} object containing graph data. [{name, value, error, color}]
 * @param {svgname} class name of svg to draw in
 * @param {yMetric} name and unit of y axis
 * @param {minVal} optional, set if yScale shouldn't exceed this value
 * @param {macVal} optional, set if yScale shouldn't exceed this value
 */
function bar2chart(data, svgname, yMetric, minVal, maxVal) {
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;
    for (var i = data.length - 1; i >= 0; i--) {
        let ma = data[i].value + data[i].error;
        let mi = data[i].value - data[i].error;
        if (ma > maxY) {
            maxY = ma;
        }
        if (mi < minY) {
            minY = mi;
        }
    }
    const domainMargin = (maxY - minY) * 0.2;
    minY -= domainMargin;
    maxY += domainMargin;
    if (minVal !== null && minY < minVal) {
        minY = minVal;
    }
    if (maxVal !== null && maxY > maxVal) {
        maxY = maxVal;
    }

    const margin = 60;

    const svg = d3.select('svg.' + svgname);
    const width = svg.node().getBoundingClientRect().width - 2 * margin;
    const height = svg.node().getBoundingClientRect().height - margin;

    const chart = svg.append('g').attr('transform', `translate(${margin}, ${margin/2})`);

    // y axis
    const yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([minY, maxY]);

    chart.append('g').call(d3.axisLeft(yScale));

    // horizontal grid lines
    chart.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft()
        .scale(yScale)
        .tickSize(-width, 0, 0)
        .tickFormat(''))

    // x axis
    const xScale = d3.scaleBand()
    .range([0, width])
    .domain(data.map((s) => s.name))
    .padding(0.5)

    chart.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

    // label y axis
    svg.append('text')
    .attr('x', -(height / 2) - margin)
    .attr('y', margin / 2.4)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text(yMetric)

    // bars
    let barGroup = chart.selectAll()
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'bar-group');

    barGroup.append('rect')
    .attr('x', (s) => xScale(s.name))
    .attr('y', (s) => yScale(s.value))
    .attr('height', (s) => height - yScale(s.value))
    .attr('width', xScale.bandwidth())
    .attr('fill', (s) => d3.rgb(s.color));
    barGroup.each(errorBarClosure(xScale, yScale));
}