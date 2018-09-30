import * as d3 from "d3";
// d3.selectAll("p").style("color", "red");
// d3.select("body").style("background-color", "black");
// d3.selectAll('p').style('color', (d, i)=>{
//     // return `hsl(${Math.random()*360},100%,50%)`
//     return i%2?'red':'#eee'
// })

// 控制大小
// d3.selectAll('p')
// .data([4,8,15,16,23,42])
// .style('font-size', (d)=>{return `${d}px`})

// // 动态添加元素
// d3.select('body')
// .selectAll('p')
// .data([4, 8, 15, 16, 23, 42])
//     .style('font-size', (d)=>{return `${d}px`})
// .enter().append('p')
// .text(d=>`I'm number ${d} !`)

// // 根据数据移除多个元素
// let p = d3.select('body')
// .selectAll('p')
//     .data([4, 8, 15, 16, 23, 42])
// .text(d=>d)
// p.exit().remove()

// 同时使用
// Update 情形2
// var p = d3.select("body")
//     .selectAll("p")
//     .data([4, 8, 15, 16, 23, 42])
//     .text(function(d) { return d; });
// // Enter 情形1
// p.enter().append('p')
//     .text(d=>d)
// // Exit 情形3
// p.exit().remove()

// // 过渡
// d3.selectAll('p').transition()
//     .duration(1000)
//     .delay((d,i)=>i*100)
// .style('background-color', 'red')