import Timeline from "./Timeline";
import {AnimateAction} from "../timeline/AnimateAction";
import {sample, sortBy, min, max} from 'lodash'
let preData = [
    {id: 1, "direction": 1, "firstDate": 1528440550500, "secondDate": 1528440551777}, // e 1528440550293
    {id: 2, "direction": 2, "firstDate": 1528440550933, "secondDate": 1528440551777},
    {id: 3, "direction": 2, "firstDate": 1528440550000, "secondDate": 1528440553049}, // s 1528440552494
    {id: 4, "direction": 2, "firstDate": 1528440553882, "secondDate": 1528440554381},
    {id: 5, "direction": 2, "firstDate": 1528440554381, "secondDate": 1528440556002}, // s 1528440555200
    {id: 6, "direction": 1, "firstDate": 1528440556826, "secondDate": 1528440557272},
    {id: 7, "direction": 1, "firstDate": 1528440558114, "secondDate": 1528440558718},
    {id: 8, "direction": 2, "firstDate": 1528440559331, "secondDate": 1528440560160},
    {id: 9, "direction": 2, "firstDate": 1528440560826, "secondDate": 1528440560885},
    {id: 10, "direction": 2, "firstDate": 1528440561025, "secondDate": 1528440561342},
    {id: 11, "direction": 1, "firstDate": 1528440562321, "secondDate": 1528440562707},
    {id: 12, "direction": 2, "firstDate": 1528440563286, "secondDate": 1528440564133},
    {id: 13, "direction": 2, "firstDate": 1528440565075, "secondDate": 1528440565769},
    {id: 14, "direction": 2, "firstDate": 1528440573424, "secondDate": 1528440574233}, // 最后的时间数据
    {id: 15, "direction": 2, "firstDate": 1528440566718, "secondDate": 1528440567444},
    {id: 16, "direction": 2, "firstDate": 1528440568121, "secondDate": 1528440568914},
    {id: 17, "direction": 1, "firstDate": 1528440569200, "secondDate": 1528440569338},
    {id: 18, "direction": 1, "firstDate": 1528440569924, "secondDate": 1528440570431},
    {id: 19, "direction": 2, "firstDate": 1528440570969, "secondDate": 1528440571860},
    {id: 20, "direction": 2, "firstDate": 1528440572163, "secondDate": 1528440572511}
]
// preData = [
//     {
//         "id": 1,
//         "direction": 1,
//         "firstDate": 0,
//         "secondDate": 567
//     },
//     {
//         "id": 2,
//         "direction": 2,
//         "firstDate": 127,
//         "secondDate": 568
//     },
//     {
//         "id": 3,
//         "direction": 1,
//         "firstDate": 249,
//         "secondDate": 568
//     },
//     {
//         "id": 4,
//         "direction": 1,
//         "firstDate": 455,
//         "secondDate": 572
//     },
//     {
//         "id": 5,
//         "direction": 2,
//         "firstDate": 541,
//         "secondDate": 838
//     },
//     {
//         "id": 6,
//         "direction": 2,
//         "firstDate": 913,
//         "secondDate": 1060
//     },
//     {
//         "id": 7,
//         "direction": 2,
//         "firstDate": 1160,
//         "secondDate": 1729
//     },
//     {
//         "id": 8,
//         "direction": 1,
//         "firstDate": 1346,
//         "secondDate": 1741
//     },
//     {
//         "id": 9,
//         "direction": 2,
//         "firstDate": 1414,
//         "secondDate": 1742
//     },
//     {
//         "id": 10,
//         "direction": 2,
//         "firstDate": 1842,
//         "secondDate": 2399
//     },
//     {
//         "id": 11,
//         "direction": 1,
//         "firstDate": 1972,
//         "secondDate": 2400
//     },
//     {
//         "id": 12,
//         "direction": 1,
//         "firstDate": 2131,
//         "secondDate": 2401
//     },
//     {
//         "id": 13,
//         "direction": 2,
//         "firstDate": 2196,
//         "secondDate": 2402
//     }
// ]
// 同步时间
let syncTime = function(arr, triggerIdx, time){
    arr.forEach((n,i)=>{
        if(i>=triggerIdx){
            n.firstDate = n.firstDate - time
            n.secondDate = n.secondDate - time
        }
    })
    return arr
}
preData = sortBy(preData, n=>n.firstDate)

let firstDateList = preData.map(n=>n.firstDate)
let secondDateList = preData.map(n=>n.secondDate)
let allDate = firstDateList.concat(secondDateList)
let tempMin = min(allDate)
let tempMax = max(allDate)
let nData = syncTime(preData, 0, tempMin)
for(let i=0;i<nData.length;i++){
    let curRow = nData[i]
    if(i!==0){
        let preRow = nData[i-1]
        let diffTime
        let lastDateList = nData.filter((n,l)=>l<i).map(n=>n.secondDate)
        let lastMaxDate = parseInt(max(lastDateList))
        if((curRow.firstDate-lastMaxDate-1)>0){
            diffTime = curRow.firstDate-lastMaxDate-10
            if(diffTime){
                nData = syncTime(nData, i, diffTime)
            }
        }
    }
}
// console.log(`preData is: ${JSON.stringify(preData)}`)

let tl = new Timeline(20, 200, 300, '#63583F', 4, false)
tl.setOption({backgroundColor: '#2F3243'})
tl.setData(nData)
// tl.setCoefficient(100000)
tl.setCoefficient(2)
tl.render()
// tl.setPlayAction(AnimateAction.pause)
// tl.setProgress(20, 'percent')


let progressEditor = document.getElementById('progress') as HTMLInputElement
progressEditor.addEventListener('change', (ev)=>{
    // tl.setProgress(progressEditor.value, 'percent')
    playAction = AnimateAction.pause
    tl.setPlayAction(playAction)
    tl.setNewProgress(progressEditor.value)
})

let stepInBtn = document.getElementById('stepIn')
stepInBtn.addEventListener('click', ()=>{
    let num = parseInt(progressEditor.value)+1
    progressEditor.value = num+''
    console.log(`value is: ${JSON.stringify(num)}`)
    tl.setNewProgress(num)
})

let stepOutBtn = document.getElementById('stepOut')
stepOutBtn.addEventListener('click', ()=>{
    let num = parseInt(progressEditor.value)-1
    progressEditor.value = num+''
    console.log(`value is: ${JSON.stringify(num)}`)
    tl.setNewProgress(num)
})
let zoom = 0
let zoomInBtn = document.getElementById('zoomIn')
zoomInBtn.addEventListener('click', ()=>{
    zoom+=0.1
    tl.setZoomInOut(zoom)
})

let zoomOutBtn = document.getElementById('zoomOut')
zoomOutBtn.addEventListener('click', ()=>{
    zoom-=0.1
    tl.setZoomInOut(zoom)
})

let playAction = AnimateAction.pause
let playBtn = document.getElementById('play')
playBtn.addEventListener('click', ()=>{
    playAction = AnimateAction.play
    tl.setPlayAction(playAction)
})
let pauseBtn = document.getElementById('pause')
pauseBtn.addEventListener('click', ()=>{
    playAction = AnimateAction.pause
    tl.setPlayAction(playAction)
})
let moveUpBtn = document.getElementById('moveUp')
moveUpBtn.addEventListener('click', ()=>{
    tl.startMove()
})
let highlightBtn = document.getElementById('highlight')
highlightBtn.addEventListener('click', ()=>{
    // playAction = AnimateAction.pause
    // tl.setPlayAction(playAction)
    tl.setHighlight(sample(preData).id)
})