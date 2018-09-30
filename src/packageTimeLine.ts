import TimelinePacket from "./timeline/TimelinePacket";
import './static/lib/bootstrap/css/bootstrap.css'

import {Direction} from "./timeline/Direction";
// import * as moment from 'moment'
import {random, min, max, minBy, maxBy, sortedUniqBy, sortBy} from 'lodash'
import {AnimateAction} from "./timeline/AnimateAction";
import Guides from "./timeline/Guides";
import {OFFSET_Y_ANIMATION_MODE, OPERATE_ACTION} from "./timeline/MyConstant";
let canvas = <HTMLCanvasElement>document.getElementById('canvas')
// canvas.style.width = 400+'px'
canvas.width = 800
canvas.height = 500
let ctx = canvas.getContext('2d')
ctx.translate(0.5, 0.5);

// let l1 = new Line(canvas, 50, 20, '#3F65AB')
// l1.setEndPoint(50, 300)
// l1.render()
//
// let l2 = new Line(canvas, 250, 20, '#3F65AB')
// l2.setEndPoint(250, 300)
// l2.render()
// let timeLineBeginY = 100
let tp = new TimelinePacket(canvas, 275, 215, 300, '#61583E')
tp.setTimeLength(1528440549603, 1528440574233)
tp.setGuidesX(300)
tp.setTimeLineWidth(3)
tp.setArrowLineWidth(2)
// tp.colors = [ // NetInsight图表预设颜色
//     '#299def', '#724bbe', '#e4873c', '#2cbdbf', '#d64952',
//     '#dac827', '#bc3297', '#8d98b3', '#92bc32', '#95706d'
// ]
// const minTimeLineHeight = 300 // 时间包最小高度
// console.log(`123 is: ${JSON.stringify(123)}`)
let data = []
// data = [
//     {direction: Direction.A_TO_B, firstDate: 1528435648869, secondDate: 1528435650006},
//     {direction: Direction.B_TO_A, firstDate: 1528435654938, secondDate: 1528435658914},
//     {direction: Direction.A_TO_B, firstDate: 1528435662079, secondDate: 1528435667080},
//     {direction: Direction.B_TO_A, firstDate: 1528435671079, secondDate: 1528435675079},
//     {direction: Direction.A_TO_B, firstDate: 1528435680079, secondDate: 1528435683079},
//     {direction: Direction.B_TO_A, firstDate: 1528435684079, secondDate: 1528435686079},
//     {direction: Direction.A_TO_B, firstDate: 1528435687080, secondDate: 1528435689079},
//     {direction: Direction.B_TO_A, firstDate: 1528435694081, secondDate: 1528435697081},
//     {direction: Direction.A_TO_B, firstDate: 1528435700878, secondDate: 1528435701562},
//     {direction: Direction.B_TO_A, firstDate: 1528435702936, secondDate: 1528435704645}
// ]
let preData = [
{/*id: 1, */"direction": 1, "firstDate": 1528440549603, "secondDate": 1528440551777}, // e 1528440550293
{/*id: 2, */"direction": 2, "firstDate": 1528440550933, "secondDate": 1528440551777},
{/*id: 3, */"direction": 2, "firstDate": 1528440550000, "secondDate": 1528440553049}, // s 1528440552494
{/*id: 4, */"direction": 2, "firstDate": 1528440553882, "secondDate": 1528440554381},
{/*id: 5, */"direction": 2, "firstDate": 1528440554381, "secondDate": 1528440556002}, // s 1528440555200
{/*id: 6, */"direction": 1, "firstDate": 1528440556826, "secondDate": 1528440557272},
{/*id: 7, */"direction": 1, "firstDate": 1528440558114, "secondDate": 1528440558718},
{/*id: 8, */"direction": 2, "firstDate": 1528440559331, "secondDate": 1528440560160},
{/*id: 9, */"direction": 2, "firstDate": 1528440560306, "secondDate": 1528440560885},
{/*id: 10, */"direction": 2, "firstDate": 1528440561025, "secondDate": 1528440561342},
{/*id: 11, */"direction": 1, "firstDate": 1528440562321, "secondDate": 1528440562707},
{/*id: 12, */"direction": 2, "firstDate": 1528440563286, "secondDate": 1528440564133},
{/*id: 13, */"direction": 2, "firstDate": 1528440565075, "secondDate": 1528440565769},
{/*id: 14, */"direction": 2, "firstDate": 1528440573424, "secondDate": 1528440574233}, // 最后的时间数据
{/*id: 15, */"direction": 2, "firstDate": 1528440566718, "secondDate": 1528440567444},
{/*id: 16, */"direction": 2, "firstDate": 1528440568121, "secondDate": 1528440568914},
{/*id: 17, */"direction": 1, "firstDate": 1528440569136, "secondDate": 1528440569338},
{/*id: 18, */"direction": 1, "firstDate": 1528440569924, "secondDate": 1528440570431},
{/*id: 19, */"direction": 2, "firstDate": 1528440570969, "secondDate": 1528440571860},
{/*id: 20, */"direction": 2, "firstDate": 1528440572163, "secondDate": 1528440572511}
]
let preBatchData = [
    [
        {"direction": 1, "firstDate": 1528440549603, "secondDate": 1528440550293},
        {"direction": 2, "firstDate": 1528440550933, "secondDate": 1528440551777},
        {"direction": 2, "firstDate": 1528440552494, "secondDate": 1528440553049}
    ],
    [
        {"direction": 2, "firstDate": 1528440553882, "secondDate": 1528440554381},
        {"direction": 2, "firstDate": 1528440555200, "secondDate": 1528440556002},
        {"direction": 1, "firstDate": 1528440556826, "secondDate": 1528440557272}
    ],
    [
        {"direction": 1, "firstDate": 1528440558114, "secondDate": 1528440558718},
        {"direction": 2, "firstDate": 1528440559331, "secondDate": 1528440560160},
        {"direction": 2, "firstDate": 1528440560306, "secondDate": 1528440560885}
    ],
    [
        {"direction": 2, "firstDate": 1528440561025, "secondDate": 1528440561342},
        {"direction": 1, "firstDate": 1528440562321, "secondDate": 1528440562707},
        {"direction": 2, "firstDate": 1528440563286, "secondDate": 1528440564133}
    ],
    [
        {"direction": 2, "firstDate": 1528440565075, "secondDate": 1528440565769},
        {"direction": 2, "firstDate": 1528440573424, "secondDate": 1528440574233}, // 最后的时间数据
        {"direction": 2, "firstDate": 1528440566718, "secondDate": 1528440567444}
    ],
    [
        {"direction": 2, "firstDate": 1528440568121, "secondDate": 1528440568914},
        {"direction": 1, "firstDate": 1528440569136, "secondDate": 1528440569338},
        {"direction": 1, "firstDate": 1528440569924, "secondDate": 1528440570431}
    ],
    [
        {"direction": 2, "firstDate": 1528440570969, "secondDate": 1528440571860},
        {"direction": 2, "firstDate": 1528440572163, "secondDate": 1528440572511}
    ]
]
// let tempDate = [
//     1528440549603,1528440550293,
//     1528440550933,1528440551777,
//     1528440552494,1528440553049,
//     1528440553882,1528440554381,1528440555200,1528440556002,1528440556826,1528440557272,
//     1528440558114,1528440558718,1528440559331,1528440560160,1528440560306,1528440560885,1528440561025,1528440561342,
//     1528440562321,1528440562707,1528440563286,1528440564133,1528440565075,1528440565769,1528440566718,
//     1528440567444,1528440568121,1528440568914,1528440569136,1528440569338,1528440569924,1528440570431,
//     1528440570969,1528440571860,1528440572163,1528440572511,1528440573424,1528440574233
// ]
// tempDate.forEach((n,idx)=>{
//     if((idx+1)%2===0) {
//         data.push({direction: random(1, 2), firstDate: tempDate[idx-1], secondDate: n})
//     }
// })
// console.log(`data is: ${JSON.stringify(data)}`)
// tp.render()

// tp.setData({type: 'time', data: data})
// tp.addAction(Direction.A_TO_B, 20, 70)
// tp.addAction(Direction.B_TO_A, 90, 120)
// tp.addAction(Direction.A_TO_B, 130, 140)
// tp.addAction(Direction.B_TO_A, 160, 180)
// tp.addAction(Direction.A_TO_B, 199, 230)
// tp.addAction(Direction.B_TO_A, 240, 240)
tp.render()

// let dynamicTime = random(500, 5000)

// let counter = 0, actions = []
// function createTime(){
//     setTimeout(function () {
//         // console.log(`dynamicTime is: ${JSON.stringify(moment().valueOf())}`)
//         dynamicTime = random(100, 1000)
//         // if(tempDateArr.length<40) {
//         //     tempDateArr.push(moment().valueOf())
//         // }else{
//         //     console.log(`tempDateArr is: ${JSON.stringify(tempDateArr)}`)
//         // }
//         actions.push(dynamicTime)
//         if((counter+1)%2===0) {
//             // actions.push({direction: random(1, 2), firstDate: tempDate[idx-1], secondDate: n})
//             tp.addAction(random(1, 2), actions[counter-1], dynamicTime)
//             tp.render()
//         }
//         createTime()
//         counter++
//     }, dynamicTime)
// }
// createTime()

let times = document.getElementById('times')
let rate = 1
let time = rate
times.innerText = time+''
canvas.onmousewheel = (ev)=>{
    tp.setOffsetAnimateMode(OFFSET_Y_ANIMATION_MODE.noAnimate)
    // console.log(ev)
    if(ev.deltaY<0&&time<4) { // zoom in
        // time+= 0.04
        time+= 0.04
        // tp.addOffsetY(ev.layerY-ev.layerY*2)
    }else if(ev.deltaY>0&&time>0.1){
        // time-= 0.04
        time-= 1
        // tp.addOffsetY(ev.layerY)
    }
    console.log(`time is: ${time}`)
    if(time>0.1) {

        console.log(`ev.layerY is: ${JSON.stringify(ev.layerY)}`)
        times.innerText = time+''
        tp.updateZoomIn(time)
        // tp.setOffsetY(ev.layerY*time-ev.layerY)
    }
}
let showAllBtn = document.getElementById('showAll')
showAllBtn.addEventListener('click', ()=>{
    const retInfo = tp.showAllAction(preData)
    console.log(`tp.progress is: ${JSON.stringify(tp.progress)}`)
    // console.log(`retInfo is: ${JSON.stringify(retInfo)}`)
})

let addOneBtn = document.getElementById('addOne')
let preDataCounter = 0
addOneBtn.addEventListener('click', ()=>{ // 添加一根线
    if(preDataCounter<19) {
        data.push(preData[preDataCounter])
        const ret = tp.showAddAction(preData[preDataCounter])
        offsetY = ret.offset
        updateVerticalOffset()
        preDataCounter++
    }
})
let showOneBtn = document.getElementById('showOne')
showOneBtn.addEventListener('click', ()=>{
    if(preDataCounter<19) {
        data.push(preData[preDataCounter])
        const ret = tp.showBatchAction([preData[preDataCounter]])
        offsetY = ret.offset
        updateVerticalOffset()
        preDataCounter+=2
    }
})
let batchPreDataCounter = 0
let showBatch = document.getElementById('showBatch')
showBatch.addEventListener('click', ()=>{
    if(batchPreDataCounter<preBatchData.length) {
        const ret = tp.showBatchAction(preBatchData[batchPreDataCounter])
        offsetY = ret.offset
        updateVerticalOffset()
        batchPreDataCounter++
    }
})
let renderInfo
let playAction = AnimateAction.pause
let playBtn = document.getElementById('play')
playBtn.addEventListener('click', ()=>{
    playAction = AnimateAction.play
    tp.setPlayAction(playAction)
})
let pauseBtn = document.getElementById('pause')
pauseBtn.addEventListener('click', ()=>{
    playAction = AnimateAction.pause
    tp.setPlayAction(playAction)
})
let clearAllBtn = document.getElementById('clearAll')
clearAllBtn.addEventListener('click', ()=>{
    tp.clearAction()
})

let progressEditor = document.getElementById('progress') as HTMLInputElement
progressEditor.addEventListener('change', (ev)=>{
    const value = progressEditor.value
    handleProgress(value)
})
progressEditor.addEventListener('keyup', (ev)=>{
    if(ev.code==='Enter') {
        const value = progressEditor.value
        handleProgress(value)
    }
})

// 控制进度
function handleProgress(value){
    tp.setProgress(value)
}

let progressInfo = document.getElementById('progressInfo')
let prevProgress
function animate(){
    // setTimeout(function () {
    // console.log(`isDone is: ${JSON.stringify(isDone)}`)
    // if(playAction === AnimateAction.play) {
        console.log('render...')
        renderInfo = tp.render()
        if(renderInfo.progress!==prevProgress) {
            progressInfo.innerText = `${renderInfo.progress}`
        }
        prevProgress = renderInfo.progress
    // }
    requestAnimationFrame(animate)
    // }, 200)
}
// setInterval(animate, 2000)
requestAnimationFrame(animate)

let renderBtn = document.getElementById('render')
renderBtn.addEventListener('click', ()=>{
    tp.render()
})
let verticalOffset = document.getElementById('verticalOffset')
let moveUp = document.getElementById('moveUp')
let offsetY = 0
function updateVerticalOffset(){
    verticalOffset.innerText = offsetY+''
}
moveUp.addEventListener('click', ()=>{
    tp.setOffsetAnimateMode(OFFSET_Y_ANIMATION_MODE.animate)
    offsetY-=30
    tp.setOffsetY(offsetY)
    tp.render()
    updateVerticalOffset()
    // console.log(`offsetY is: ${JSON.stringify(offsetY)}`)
})

let moveDown = document.getElementById('moveDown')
moveDown.addEventListener('click', ()=>{
    tp.setOffsetAnimateMode(OFFSET_Y_ANIMATION_MODE.animate)
    offsetY+=30
    tp.setOffsetY(offsetY)
    tp.render()
    updateVerticalOffset()
    console.log(`offsetY is: ${JSON.stringify(offsetY)}`)
})
let mousePosition = {
    drag: false,
    prevY: null
}
canvas.onmousemove = (ev)=>{
    const x = ev.layerX
    const y = ev.layerY
    if(mousePosition.drag) {
        let diff = y-mousePosition.prevY
        // console.log(`diff is: ${JSON.stringify(diff)}`)
        tp.addOffsetY(diff)
        mousePosition.prevY = y
    }
    tp.setDetectionPoint({x: x, y: y}, OPERATE_ACTION.move)
}
canvas.onmousedown = ev => {
    tp.setOffsetAnimateMode(OFFSET_Y_ANIMATION_MODE.noAnimate)
    mousePosition.drag = true
    mousePosition.prevY = ev.layerY
}
canvas.onmouseup = ev => {
    mousePosition.drag = false
}

canvas.onclick = (ev => {
    const x = ev.layerX
    const y = ev.layerY
    // console.log(`x ${x}, y ${y}`)
    tp.setDetectionPoint({x,y}, OPERATE_ACTION.click)
})