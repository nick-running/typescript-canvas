import Timeline from "./Timeline2";
import '../static/lib/bootstrap/css/bootstrap.css'
import * as d3 from "d3";

import {sample, sortBy, min, max, pull} from 'lodash'
import {AnimateAction} from "../timeline/AnimateAction";
import {Emitter} from "./Timeline2";
// import {Emitter} from "./Emitter";
let preData = [
    {id: 1, "direction": 1, "firstDate": 1528440550500, "secondDate": 1528440551777}, // e 1528440550293
    {id: 2, "direction": 2, "firstDate": 1528440550933, "secondDate": 1528440551777},
    {id: 3, "direction": 2, "firstDate": 1528440550000, "secondDate": 1528440553049}, // s 1528440552494
    {id: 4, "direction": 2, "firstDate": 1528440553882, "secondDate": 1528440554381},
    {id: 5, "direction": 2, "firstDate": 1528440554381, "secondDate": 1528440556002}, // s 1528440555200
    {id: 6, "direction": 1, "firstDate": 1528440556826, "secondDate": 1528440557272},
    // {id: 7, "direction": 1, "firstDate": 1528440558114, "secondDate": 1528440558718},
    // {id: 8, "direction": 2, "firstDate": 1528440559331, "secondDate": 1528440560160},
    // {id: 9, "direction": 2, "firstDate": 1528440560826, "secondDate": 1528440560885},
    {id: 10, "direction": 2, "firstDate": 1528440561025, "secondDate": 1528440561342},
    // {id: 11, "direction": 1, "firstDate": 1528440562321, "secondDate": 1528440562707},
    // {id: 12, "direction": 2, "firstDate": 1528440563286, "secondDate": 1528440564133},
    // {id: 13, "direction": 2, "firstDate": 1528440565075, "secondDate": 1528440565769},
    // {id: 14, "direction": 2, "firstDate": 1528440573424, "secondDate": 1528440574233}, // 最后的时间数据
    // {id: 15, "direction": 2, "firstDate": 1528440566718, "secondDate": 1528440567444},
    // {id: 16, "direction": 2, "firstDate": 1528440568121, "secondDate": 1528440568914},
    // {id: 17, "direction": 1, "firstDate": 1528440569200, "secondDate": 1528440569338},
    // {id: 18, "direction": 1, "firstDate": 1528440569924, "secondDate": 1528440570431},
    // {id: 19, "direction": 2, "firstDate": 1528440570969, "secondDate": 1528440571860},
    // {id: 20, "direction": 2, "firstDate": 1528440572163, "secondDate": 1528440572511}
]
let preData2 = [
    {
        "id": 100,
        "direction": 1,
        "firstDate": 0,
        "secondDate": 567,
	      "text": "BZ9L"
    },
    {
        "id": 101,
        "direction": 2,
        "firstDate": 127,
        "secondDate": 568,
	      "text": "FW2QM9E"
    },
    {
        "id": 102,
        "direction": 1,
        "firstDate": 249,
        "secondDate": 568,
	      "text": "NAC"
    },
    {
        "id": 103,
        "direction": 1,
        "firstDate": 455,
        "secondDate": 572,
	      "text": "HFYJO"
    },
    {
        "id": 104,
        "direction": 2,
        "firstDate": 541,
        "secondDate": 838,
	      "text": "OEBS"
    },
    {
        "id": 105,
        "direction": 2,
        "firstDate": 913,
        "secondDate": 1060,
	      "text": "UEDEQ4WC"
    },
    {
        "id": 106,
        "direction": 2,
        "firstDate": 1160,
        "secondDate": 1729,
	      "text": "BNSI"
    },
    {
        "id": 107,
        "direction": 1,
        "firstDate": 1346,
        "secondDate": 1741,
	      "text": "PJ20OF"
    },
    {
        "id": 108,
        "direction": 2,
        "firstDate": 1414,
        "secondDate": 1742,
	      "text": "IAB5"
    },
    // {
    //     "id": 109,
    //     "direction": 2,
    //     "firstDate": 1842,
    //     "secondDate": 2399
    // },
    // {
    //     "id": 110,
    //     "direction": 1,
    //     "firstDate": 1972,
    //     "secondDate": 2400
    // },
    // {
    //     "id": 111,
    //     "direction": 1,
    //     "firstDate": 2131,
    //     "secondDate": 2401
    // },
    // {
    //     "id": 112,
    //     "direction": 2,
    //     "firstDate": 2196,
    //     "secondDate": 2402
    // }
]
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
let firstDateList = preData.map(n=>n.firstDate)
let secondDateList = preData.map(n=>n.secondDate)
let allDate = firstDateList.concat(secondDateList)
let tempMin = min(allDate)
let nData = syncTime(preData, 0, tempMin)
for(let i=0;i<nData.length;i++){
    let curRow = nData[i]
    if(i!==0){
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

let tl = new Timeline('#canvas',
    'auto', 200, 300, '#63583F', 4,
    false)
tl.setOption({
	backgroundColor: '#2F3243',
	info: {source: '服务器1.1.1.1', target: '客户端2.2.2.2'}
})
tl.setCoefficient(20)
tl.setProgress(100)
tl.setData([])
tl.render()

Emitter.register('interruptProgress', function (evName, args1, args2) {
    console.log('interruptProgress')
    // console.log('123412....')
    // console.log(`args1 is: ${JSON.stringify(args1)}`)
    // console.log(`args2 is: ${JSON.stringify(args2)}`)
}, this)
let highlightRowText = document.getElementById('highlightRow')
// highlightRowText.innerText = '2'
let highlightList = []
Emitter.register('highlightStart', function (evName, args1, args2) {
    highlightList.push(args1)
    highlightRowText.innerText = highlightList.join(',')
    console.log('on highlightStart...', args1)
}, this)
Emitter.register('highlightEnd', function (evName, args1, args2) {
    pull(highlightList, args1)
    highlightRowText.innerText = highlightList.join(',')
    console.log('on highlightEnd...', args1)
}, this)


let playBtn = document.getElementById('play')
playBtn.addEventListener('click', ()=>{
    tl.setPlayAction('play')
})
let pauseBtn = document.getElementById('pause')
pauseBtn.addEventListener('click', ()=>{
    tl.setPlayAction('pause')
})

let progressEditor = document.getElementById('progress') as HTMLInputElement
progressEditor.addEventListener('change', (ev)=>{
    tl.setProgress(progressEditor.value)
    tl.render()
})
let stepInBtn = document.getElementById('stepIn')
stepInBtn.addEventListener('click', ()=>{
    let num = parseInt(progressEditor.value)+1
    progressEditor.value = num+''
    tl.setProgress(num)
    tl.render()
})

let stepOutBtn = document.getElementById('stepOut')
stepOutBtn.addEventListener('click', ()=>{
    let num = parseInt(progressEditor.value)-1
    progressEditor.value = num+''
    tl.setProgress(num)
    tl.render()
})

let moveUpBtn = document.getElementById('moveUp')
moveUpBtn.addEventListener('click', ()=>{
    tl.startMove()
})
let switchDataBtn = document.getElementById('switchData')
let toggle = true
switchDataBtn.addEventListener('click', ()=>{
    tl.setData(toggle?preData2:preData)
    tl.render()
    toggle = !toggle
})