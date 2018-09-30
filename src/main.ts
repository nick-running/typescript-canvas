import './styles/common.css'
import ShapeNode from './topology/ShapeNode'

const server = require('./static/images/server.png')
const computer = require('./static/images/computer.png')
// class Big{
//     min: number
//     max: number
// }
// let big = new Big()
// big.min = 3
// console.log(1234)
// document.getElementById('container').style.border = '1px solid red'

let canvas = <HTMLCanvasElement>document.getElementById('canvas')
canvas.width = 800
canvas.height = 380
// let n1 = new ShapeNode(canvas, 100, 100, 'http://www.iconpng.com/png/gnome-desktop/network-server.png', 'red')
// n1.render()
const store = {
    server: {imgSrc: server},
    computer: {imgSrc: computer}
}

// let nodeItemList: NodeListOf<Element> = document.getElementsByClassName('node-item')
// for(let i=0;i<nodeItemList.length;i++) {
//     addClickEvent(nodeItemList[i])
// }
// let shapeNodeList = []
// function addClickEvent(nodeItem){
//     nodeItem.addEventListener('click', function () {
//         let type = nodeItem.getAttribute('data-type')
//
//         let n1 = new ShapeNode(canvas, 100, 100, store[type].imgSrc, 'red')
//         n1.render()
//         shapeNodeList.push(n1)
//     })
// }
// canvas.addEventListener('mousedown', ev=>{
//     // console.log(ev)
//     if(ev.button===0) {
//         // mouseStatus.action.down = true
//         // board.createAFreeLine()
//     }
// })
// canvas.addEventListener('mouseup', ev=>{
//     if(ev.button===0) {
//         // mouseStatus.action.down = false
//         // board.brushUp()
//         // console.log(board.brushDrawPath)
//     }
// })
// canvas.addEventListener('mousemove', ev => {
//     // console.log(ev)
//     // console.log(ev)
//     let layerX = ev.layerX
//     let layerY = ev.layerY
//     console.log(`layerX: ${layerX}, layerY: ${layerY}`)
//     // console.log(shapeNodeList)
//     shapeNodeList.forEach(item=>{
//         item.checkRange(layerX, layerY)
//         item.render()
//     })
//     // console.log('mouseStatus is: ')
//     // console.log(mouseStatus)
//
//     // if(mouseStatus.action.down) {
//     //     board.drawing(layerX, layerY)
//     // }
// })
// console.log(typeof nodeItemList)
// for(let item in nodeItemList) {
//     console.log(item)
// }
