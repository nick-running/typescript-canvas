import SingleArrow from "./SingleArrow";
import * as d3 from "d3";
import {Direction} from "../timeline/Direction";
import Guides from "./Guides";
import {min, max, find, findIndex} from 'lodash'
import {ANIMATION_MODE} from "../timeline/MyConstant";
import {Color} from "../Api/MyEnum";
import {AnimateAction} from "../timeline/AnimateAction";
class Tooltip{
    show: boolean = false
    x: number = 0
    y: number = 0
    offset: number = 15
    text: string
}
class ReadyAnimate{
    x: number
    y: number
    constructor(x: number, y: number){
        this.x = x
        this.y = y
    }
}
export default class Timeline{
    svg: any
    canvas: any
    canvasWidth: number
    canvasHeight: number
    lineData: Array<{x1: number, y1: number, x2: number, y2: number, lineWidth: number}>
    backgroundColor: string
    width: number
    height: number
    lineColor: string
    lineWidth: number = 20
    x: number
    y: number
    startPointX: number
    endPointX: number
    boundWidth: number
    primaryColor: string
    tooltip: Tooltip = new Tooltip()
    playAction: string = 'play'
    progress: number
    progressType: string
    curTransY: number = 0
    progressTimer: any
    scale: any
    newScale: any
    yZoom: any
    initScalable: boolean

    guidesWidth: number = 300

    private data: Array<{id: any, direction: number, firstDate: number, secondDate: number}> = []
    private timeLineData: Array<{id: any, direction: number, firstY: number, secondY: number, firstYPercent?:number, secondYPercent?:number}> = []
    minTime: number
    maxTime: number
    timeRate: number
    playTimeRatio: number
    coefficient: number = 1
    diffTime: number
    actions: Array<any> = []
    oActions: Array<any> = []

    constructor(x, width: number, height: number, lineColor: string, lineWidth?: number, initScalable?: boolean){
        this.x = x
        this.width = width
        this.height = height
        this.lineColor = lineColor
        this.boundWidth = lineWidth/2
        this.startPointX = x+this.boundWidth
        this.endPointX = x+width-this.boundWidth
        this.primaryColor = lineColor

        if(lineWidth) this.lineWidth = lineWidth
        if(initScalable) this.initScalable = initScalable
        this.init()
    }
    private init(){
        // this.svg = d3.select('#canvas')
        // this.canvas = d3.select('#canvas').append('defs').append('g').attr('id', 'timeline')
        // this.canvasWidth = parseInt(this.svg.attr('width'))
        // this.canvasHeight = parseInt(this.svg.attr('height'))

        // this.svg.append('use').attr('xlink:href', '#timeline')
        //     .attr('y', 500)
        //     .attr('id', 'useTimeline')

        this.canvas = d3.select('#canvas')
        this.canvasWidth = this.canvas.attr('width')
        this.canvasHeight = this.canvas.attr('height')
        this.setAutoPosition()
        this.scale = d3.scaleLinear().domain([0,10]).range([0,10])
        this.newScale = this.scale

        let tlG = this.canvas.append('g').attr('class', 'tlg')
        const startY = 0
        this.lineData = [
            {x1: this.x, y1: startY, x2: this.x, y2: startY+this.height, lineWidth: this.lineWidth},
            {x1: this.x+this.width, y1: startY, x2: this.x+this.width, y2: startY+this.height, lineWidth: this.lineWidth},
            {x1: this.x+this.guidesWidth, y1: startY, x2: this.x+this.guidesWidth, y2: startY+this.height, lineWidth: 1},
        ]


        tlG.selectAll('.tl').data(this.lineData)
            .enter().append('line')
            .attr('class', 'tl')
            .style('stroke', this.lineColor)
            .style('stroke-width', n=>n.lineWidth)
            .attr('x1', n=>n.x1)
            .attr('y1', n=>n.y1)
            .attr('x2', n=>n.x2)
            .attr('y2', n=>n.y2)

        let defs = this.canvas.append("defs")
        this.generateArrowMarker("arrowSend", defs, Color.Send)
        this.generateArrowMarker("arrowReceive", defs, Color.Receive)
        this.generateArrowMarker("arrowActive", defs, Color.Active)
        d3.select('body').append('div')
            .attr('id', 'tooltip')
            .style('top', '0')
            .style('left', '0')
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.5)')
            .style('width', '100px')
            .style('height', '60px')
            .style('color', '#fff')
            .style('padding', '5px')
            .style('border-radius', '4px')
            .style('display', 'none')
            .style('z-index', '10')
            .text('0')
        this.renderBaseLine()
    }

    renderBaseLine(){
        this.canvas.selectAll('.tl')
            .attr('y1', n=>n.y1)
            .attr('y2', n=>n.y2)
    }
    generateArrowMarker(id, defs, color){
        let arrowPath = "M2,2 L2,11 L10,6 L2,2";
        let arrowMarker = defs.append("marker")
            .attr("id",id)
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","12")
            .attr("markerHeight","12")
            .attr("viewBox","0 0 12 12")
            .attr("refX","6")
            .attr("refY","6")
            .attr("orient","auto");
        arrowMarker.append("path")
            .attr("d", arrowPath)
            .attr("fill", color)
    }
    startMove(){
        // this.svg.select('#useTimeline').transition()
        //     .ease(d3.easeLinear)
        //     .duration(this.diffTime)
        //     .attr('y', 0)
        // console.log(this.yZoom)
        // console.log(this.diffTime*this.playTimeRatio)
        // this.canvas.transition().duration(100).call(this.yZoom.transform, d3.zoomIdentity);
        // console.log(`this.newScale(100) is: ${JSON.stringify(this.newScale(100))}`)
        this.canvas.transition()
            .ease(d3.easeLinear).duration(100).call(this.yZoom.translateTo, 0, 250)
        // this.canvas.selectAll('.t-arrow').transition().duration(2000)
        //     .attr('y1', n=>{
        //         return n.singleArrow.y1+=200
        //     })
        //     .attr('y2', n=>{
        //         return n.singleArrow.y2+=200
        //     })
    }
    setPlayAction(playAction){
        // console.log(`this.progress is: ${JSON.stringify(this.progress)}`)
        if(typeof playAction==='number') {
            this.playAction = playAction===1?'play':'pause'
        }
        this.canvas.selectAll('.t-arrow, .guides').interrupt()
        if(this.playAction==='pause') {

        }else{
            console.log(`play this.progress is: ${this.progress}`)
            this.setNewProgress(this.progress+1)
        }
        // console.log(`this.progress is: ${JSON.stringify(this.progress)}`)
        // console.log(`this.progressType is: ${JSON.stringify(this.progressType)}`)
    }
    setZoomInOut(zoom){
        // console.log(`zoom is: ${JSON.stringify(zoom)}`)
        // this.scale = d3.scaleLinear().domain([0,10]).range([0, 10*zoom])
        // this.actions.forEach(n=>{
        //     n.readyAnimate.y = this.scale(n.readyAnimate.y)
        //     n.singleArrow.y1 = this.scale(n.singleArrow.y1)
        //     n.singleArrow.y2 = this.scale(n.singleArrow.y2)
        // })
    }
    setProgress(progress, type) {
        this.progress = parseFloat(progress)
        this.progressType = type
        console.log('entered setProgress-----------------------')
        // console.log(`this.progress is: ${JSON.stringify(this.progress)}`)
        // console.log(`type is: ${JSON.stringify(type)}`)
        this.canvas.selectAll('.t-arrow, .guides').interrupt()
        const _this = this
        let progressH = 0
        if(type==='percent') {
            progressH = this.newScale(this.height*progress/100)
        }else{ // index
            progressH = (progress-this.minTime)/this.timeRate+this.y
            // progressH = progress-this.y
        }
        // console.log(`progressHeight is: ${JSON.stringify(progressH)}`)

        // if(this.progressTimer) clearTimeout(this.progressTimer)
        let playAction = this.playAction

        // console.log(`playAction is: ${JSON.stringify(playAction)}`)
        // if(playAction==='play'){
        //     this.playAction = 'pause'
        //     this.clearCanvas()
        // }else{
        //     this.canvas.selectAll('.t-arrow').interrupt();
        // }
        let ifBeforeProgress = index=> this.actions[index].readyAnimate.y<(progressH+this.y)

        // console.log('setProgress playAction is '+playAction)
        let playCount = (index, readyVal, arrowVal)=>{
            if(playAction==='play'){
                return arrowVal
            }else if(playAction==='pause'){
                console.log('pause...')
                return readyVal
            }
        }

        let arrow = this.canvas.selectAll('.t-arrow')
            .style('stroke', n=>{
                if(n.active) return Color.Active
                if(n.direction===Direction.A_TO_B) {
                    return Color.Send
                }else{
                    return Color.Receive
                }
            })
            .attr('x1', n=>n.readyAnimate.x)
            .attr('y1', n=>n.readyAnimate.y)
            .attr('x2', (n,idx)=>{
                let item = this.actions[idx]
                const angle = item.singleArrow.angle
                // console.log(`angle is: ${JSON.stringify(angle)}`)
                let progressX
                let progressY = progressH+this.y
                let x
                if(item.direction===Direction.A_TO_B) {
                    if(progressY>n.readyAnimate.y&&progressY<n.singleArrow.y2){
                        // x = (progressH-(item.singleArrow.y1-this.y))/Math.sin(angle*Math.PI/180)
                        const x = (progressH-(item.singleArrow.y1-this.y))/Math.tan(angle*Math.PI/180)

                        progressX = x+this.x
                        return progressX
                    }else if(progressY>=n.singleArrow.y2){
                        return n.singleArrow.x2
                    }else if(progressY<=n.singleArrow.y2){
                        return n.readyAnimate.x
                    }
                }else{
                    const lineHeight = (progressH-(item.singleArrow.y1-this.y))
                    // x = lineHeight/Math.sin(angle*Math.PI/180)
                    x = lineHeight/Math.tan(angle*Math.PI/180)
                    progressX = n.singleArrow.x1-x+8
                    if(progressY>n.readyAnimate.y&&progressY<n.singleArrow.y2){
                        return progressX
                    }else if(progressY>=n.singleArrow.y2){
                        return n.singleArrow.x2
                    }else if(progressY<=n.singleArrow.y2){
                        return n.readyAnimate.x
                    }
                }
            })
            .attr('y2', n=>{
                let progressY = progressH+this.y
                let retY
                if(progressY>n.readyAnimate.y&&progressY<n.singleArrow.y2){
                    retY = progressY
                }else if(progressY<n.singleArrow.y2){
                    retY = n.readyAnimate.y
                }else if(progressY>=n.singleArrow.y2) {
                    retY = n.singleArrow.y2
                }
                return retY
            })
            .attr('marker-end', n=>{
                let progressY = progressH+this.y
                if(progressY>n.readyAnimate.y&&progressY<n.singleArrow.y2){
                    if(n.active) return 'url(#arrowActive)'
                    return n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)'
                }else if(progressY<n.singleArrow.y2){
                    return 'none'
                }else if(progressY>=n.singleArrow.y2) {
                    if(n.active) return 'url(#arrowActive)'
                    return n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)'
                }
            })
        this.canvas.selectAll('.guides')
            .attr('opacity', (n,i)=>{
                if(ifBeforeProgress(i)){
                    return 1
                }else{
                    if(playAction==='play') {
                        return 1
                    }else{
                        return 0
                    }
                }
            })

        if(playAction==='pause') return
        arrow.transition() // 开始动画
            .ease(d3.easeLinear)
            .duration((n,i)=>{
                let item = this.actions[i]
                return (item.singleArrow.y2-item.singleArrow.y1)*this.playTimeRatio
            })
            .delay((d,i)=>{
                let item = this.actions[i]
                return (item.singleArrow.y1 - this.y - progressH) * this.playTimeRatio
            })
            .attr('x2', (n,i)=>{
                return n.singleArrow.x2
            })
            .attr('y2', (n,i)=>{
                return n.singleArrow.y2
            })
            .attr('marker-end', (n,i)=>{
                if(n.active) return 'url(#arrowActive)'
                if(ifBeforeProgress(i)){
                    if(n.direction===Direction.A_TO_B) {
                        return 'url(#arrowSend)'
                    }else{
                        return 'url(#arrowReceive)'
                    }
                }else{
                    if(playAction==='play') {
                        if(n.direction===Direction.A_TO_B) {
                            return 'url(#arrowSend)'
                        }else{
                            return 'url(#arrowReceive)'
                        }

                    }else{
                        return 'none'
                    }
                }
            })
            .on("end", function repeat(data) {
                _this.progress = (data.singleArrow.y2-_this.y)/_this.height*100
            })
            .on("interrupt", function repeat(ev, ev2, ev3) {
                const curProgressH = ev3[ev2].getAttribute('y2') // 当前暂停进度
                _this.progress = (curProgressH-_this.y)/_this.height*100
                console.log(`interrupt _this.progress is: ${JSON.stringify(_this.progress)}`)
            })

        this.canvas.selectAll('.guides')
            .attr('opacity', 0)
            .transition() // 开始动画
            .ease(d3.easeLinear)
            .duration((n,i)=>{
                let item = this.actions[i]
                return (item.singleArrow.y2-item.singleArrow.y1)*this.playTimeRatio
            })
            .delay((d,i)=>{
                let item = this.actions[i]
                return (item.singleArrow.y1-this.y-progressH)*this.playTimeRatio
            })
            .attr('opacity', (n,i)=>{
                if(ifBeforeProgress(i)){
                    return 1
                }else{
                    if(playAction==='play') {
                        return 1
                    }else{
                        return 0
                    }
                }
            })
    }

    setNewProgress(progress){
        this.progress = parseFloat(progress)
        console.log('entered setNewProgress-----------------------')
        console.log(`this.progress is: ${JSON.stringify(this.progress)}`)
        const _this = this
        // console.log(`this.height is: ${JSON.stringify(this.height)}`)
        const progressH = this.newScale(this.height*progress/100)

        console.log(`progressHeight is: ${JSON.stringify(progressH)}`)
        // console.log(`this.newScale(this.height*progress/100) is: ${JSON.stringify(this.newScale(this.height)*progress/100)}`)
        // console.log(`this.newScale(270) is: ${JSON.stringify(this.newScale(270))}`)
        this.canvas.selectAll('.t-arrow, .guides').interrupt()
        let playAction = this.playAction
        let ifBeforeProgress = index=> _this.newScale(_this.actions[index].readyAnimate.y)<progressH

        let arrow = this.canvas.selectAll('.t-arrow')
            .style('stroke', n=>{
                if(n.active) return Color.Active
                if(n.direction===Direction.A_TO_B) {
                    return Color.Send
                }else{
                    return Color.Receive
                }
            })
            .attr('x1', n=>n.readyAnimate.x)
            .attr('y1', n=>this.newScale(n.readyAnimate.y))
            .attr('x2', (n,idx)=>{
                let item = this.actions[idx]
                let sa = item.singleArrow
                let height = this.newScale(sa.y2)-this.newScale(sa.y1)

                let progressX
                let x
                if(item.direction===Direction.A_TO_B) {
                    let actualWidth = sa.x2-sa.x1
                    let angle = Math.atan(height/actualWidth)*180/Math.PI
                    if(progressH>this.newScale(n.readyAnimate.y)&&progressH<this.newScale(sa.y2)){
                        // x = (progressH-(item.singleArrow.y1-this.y))/Math.sin(angle*Math.PI/180)
                        const x = (progressH-(this.newScale(sa.y1)))/Math.tan(angle*Math.PI/180)
                        progressX = x+this.x
                        return progressX
                    }else if(progressH>=this.newScale(sa.y2)){
                        return sa.x2
                    }else if(progressH<=this.newScale(sa.y2)){
                        return n.readyAnimate.x
                    }
                }else{
                    const actualWidth = this.width
                    const lineHeight = (progressH-(this.newScale(item.singleArrow.y1)))
                    // x = lineHeight/Math.sin(angle*Math.PI/180)
                    let angle = Math.atan(height/actualWidth)*180/Math.PI
                    x = lineHeight/Math.tan(angle*Math.PI/180)
                    progressX = sa.x1-x+8
                    if(progressH>this.newScale(n.readyAnimate.y)&&progressH<this.newScale(n.singleArrow.y2)){
                        return progressX
                    }else if(progressH>=this.newScale(n.singleArrow.y2)){
                        return n.singleArrow.x2
                    }else if(progressH<=this.newScale(n.singleArrow.y2)){
                        return n.readyAnimate.x
                    }
                }
            })
            .attr('y2', n=>{
                let retY
                if(progressH>this.newScale(n.readyAnimate.y)&&progressH<this.newScale(n.singleArrow.y2)){
                    // console.log(`y2为progressH高：${progressH}`)
                    retY = progressH
                }else if(progressH<this.newScale(n.singleArrow.y2)){
                    retY = this.newScale(n.readyAnimate.y)
                }else if(progressH>=this.newScale(n.singleArrow.y2)) {
                    retY = this.newScale(n.singleArrow.y2)
                }
                return retY
            })
            .attr('marker-end', n=>{
                // if(progressH>_this.newScale(n.readyAnimate.y)&&progressH<_this.newScale(n.singleArrow.y2)){
                //     if(n.active) return 'url(#arrowActive)'
                //     return n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)'
                // }else if(progressH<_this.newScale(n.singleArrow.y2)){
                    return 'none'
                // }else if(progressH>=_this.newScale(n.singleArrow.y2)) {
                //     if(n.active) return 'url(#arrowActive)'
                //     return n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)'
                // }
            })
        this.canvas.selectAll('.guides')
            .attr('opacity', (n,i)=>{
                if(ifBeforeProgress(i)){
                    return 1
                }else{
                    if(playAction==='play') {
                        return 1
                    }else{
                        return 0
                    }
                }
            })
        this.canvas.selectAll('.t-start-guides-l')
            .attr('y1', n=>_this.newScale(n.startGuides.y1))
            .attr('y2', n=>_this.newScale(n.startGuides.y2))
        this.canvas.selectAll('.t-end-guides-l')
            .attr('y1', n=>_this.newScale(n.endGuides.y1))
            .attr('y2', n=>_this.newScale(n.endGuides.y2))
        this.canvas.selectAll('.t-start-guides-o-c')
            .attr('cy', n=>_this.newScale(n.startGuides.y2))
        this.canvas.selectAll('.t-start-guides-c')
            .attr('cy', n=>_this.newScale(n.startGuides.y2))
        this.canvas.selectAll('.t-end-guides-o-c')
            .attr('cy', n=>_this.newScale(n.endGuides.y2))
        this.canvas.selectAll('.t-end-guides-c')
            .attr('cy', n=>_this.newScale(n.endGuides.y2))


        if(playAction==='pause') return
        // const playTimeRatio = _this.newScale(_this.playTimeRatio)
        // console.log(`_this.height is: ${JSON.stringify(_this.height)}`)
        // console.log(`_this.newScale(_this.height) is: ${JSON.stringify(_this.newScale(_this.height))}`)
        const playTimeRatio = _this.diffTime/_this.newScale(_this.height)*_this.coefficient // todo 好像有bug
        // console.log(`playTimeRatio is: ${JSON.stringify(playTimeRatio)}`)
        let totalTime = _this.diffTime*_this.coefficient
        // console.log(`totalTime is ${totalTime}`)
        // arrow.transition().duration(2000).call(_this.yZoom.translateTo, 0, _this.newScale(_this.height))

        // arrow.transition() // 开始动画
        //     .ease(d3.easeLinear)
        //     .duration((n,i)=>{
        //         let item = this.actions[i]
        //         return (_this.newScale(item.singleArrow.y2)-_this.newScale(item.singleArrow.y1))*playTimeRatio
        //     })
        //     .delay((d,i)=>{
        //         let item = this.actions[i]
        //         // console.log(`(_this.newScale(item.singleArrow.y1) - progressH) * playTimeRatio is: ${JSON.stringify((_this.newScale(item.singleArrow.y1) - progressH) * playTimeRatio)}`)
        //         let time = (_this.newScale(item.singleArrow.y1) - progressH) * playTimeRatio
        //         const fTime = time<0?0:time
        //         // console.log(`fTime is: ${JSON.stringify(fTime)}`)
        //         return fTime
        //     })
        //     .attr('x2', (n,i)=>{
        //         return n.singleArrow.x2
        //     })
            // .attr('y1', (n,i)=>{
            //     return _this.newScale(n.singleArrow.y1)
            // })
            // .attr('y2', (n,i)=>{
            //     return _this.newScale(n.singleArrow.y2)
            // })
            // .attr('marker-end', (n,i)=>{
            //     if(n.active) return 'url(#arrowActive)'
            //     if(ifBeforeProgress(i)){
            //         if(n.direction===Direction.A_TO_B) {
            //             return 'url(#arrowSend)'
            //         }else{
            //             return 'url(#arrowReceive)'
            //         }
            //     }else{
            //         if(playAction==='play') {
            //             if(n.direction===Direction.A_TO_B) {
            //                 return 'url(#arrowSend)'
            //             }else{
            //                 return 'url(#arrowReceive)'
            //             }
            //         }else{
            //             return 'none'
            //         }
            //     }
            // })
        totalTime = 3000
        arrow.transition() // 垂直动画
            .ease(d3.easeLinear)
            .duration((n,i)=>{
                let item = this.actions[i]
                return (_this.newScale(item.singleArrow.y2)-_this.newScale(item.singleArrow.y1))*playTimeRatio
            })
            .delay((d,i)=>{
                let item = this.actions[i]
                // console.log(`(_this.newScale(item.singleArrow.y1) - progressH) * playTimeRatio is: ${JSON.stringify((_this.newScale(item.singleArrow.y1) - progressH) * playTimeRatio)}`)
                let time = (_this.newScale(item.singleArrow.y1) - progressH) * playTimeRatio
                const fTime = time<0?0:time
                // console.log(`fTime is: ${JSON.stringify(fTime)}`)
                return fTime
            })
            .attr('x2', (n,i)=>{
                return n.singleArrow.x2
            })
            // .attr('y1', (n,i)=>{
            //     return _this.newScale(n.singleArrow.y1)+10
            // })
            .attr('y2', (n,i)=>{
                return _this.newScale(n.singleArrow.y2)
            })

        // arrow.filter(function(d, i) { return i==7 })
        //     .transition()
        //     .ease(d3.easeLinear)
        //     // .delay(2000)
        //     .duration(750)
        //         .attr('x2', (n,i)=>{
        //             return n.singleArrow.x2
        //         })
        //     .attr('y1', (n,i)=>{
        //         return _this.newScale(n.singleArrow.y1)+50
        //     })
        //     .attr('y2', (n,i)=>{
        //         return _this.newScale(n.singleArrow.y2)+50
        //     })
        // arrow.filter(function(d, i) { return i==7 })
        //     .transition()
        //     .delay(750)
        //     .ease(d3.easeLinear)
        //     // .delay(2000)
        //     .duration(totalTime-750)
        //         .attr('x2', (n,i)=>{
        //             return n.singleArrow.x2
        //         })
        //     .attr('y1', (n,i)=>{
        //         return _this.newScale(n.singleArrow.y1)+150
        //     })
        //     .attr('y2', (n,i)=>{
        //         return _this.newScale(n.singleArrow.y2)+150
        //     })


            .on("end", function repeat(data, i) {
                console.log(`i is: ${JSON.stringify(i)}`)
                // _this.playAction = 'pause'
                const tl = _this.canvas.select('.tl')
                const y1H = tl.attr('y1')
                const y2H = tl.attr('y2')
                _this.progress = _this.newScale(data.singleArrow.y2)/(y2H-y1H)*100


                const scaleY2 = _this.newScale(data.singleArrow.y2)

                console.log(`data.id is: ${JSON.stringify(data.id)}`)
                console.log(`scaleY2 is: ${JSON.stringify(scaleY2)}`)
                console.log(`_this.curTransX is: ${JSON.stringify(_this.curTransY)}`)
                console.log(`data.singleArrow.y2 is: ${JSON.stringify(data.singleArrow.y2)}`)
                console.log(`diff is: ${JSON.stringify(Math.abs(scaleY2-_this.curTransY))}`)

                // if(Math.abs(scaleY2-_this.curTransY)>250+100) {
                if(_this.newScale(data.singleArrow.y2)>250+20&&i<_this.actions.length-1) {
                    console.log(`set transY...`);
                    _this.curTransY = _this.newScale(data.singleArrow.y2)

                    _this.setPlayAction(2)
                    _this.canvas.transition()
                        .ease(d3.easeLinear).duration(100).call(_this.yZoom.translateTo, 0, _this.newScale(data.singleArrow.y2))
                    setTimeout(function () {

                    _this.setPlayAction(1)
                    },100)
                }

            })
            .on("interrupt", function repeat(ev, ev2, ev3) {
                console.log(`interrupt...`)
                const tl = _this.canvas.select('.tl')
                const y1H = tl.attr('y1')
                const y2H = tl.attr('y2')
                // console.log(`y1H is: ${JSON.stringify(y1H)}`)
                // console.log(`y2H is: ${JSON.stringify(y2H)}`)
                const lh = y2H-y1H
                const endH = ev3[ev2].getAttribute('y2')
                // console.log(`开始高度 is: ${JSON.stringify(y1H)}`)
                // console.log(`结束高度 is: ${JSON.stringify(endH)}`)
                const curProgressH = endH-y1H // 当前暂停进度
                // console.log(`箭头原始总高 is: ${lh}`)
                const height = y2H-y1H

                // console.log(`箭头计算当前高度：${height}`)

                _this.progress = curProgressH/height*100
                // console.log(`interrupt _this.progress is: ${JSON.stringify(_this.progress)}`)
                // console.log(`\r\n`)
            })

        this.canvas.selectAll('.guides')
            .attr('opacity', 0)
            .transition() // 开始动画
            .ease(d3.easeLinear)
            .duration((n,i)=>{
                let item = this.actions[i]
                return (_this.newScale(item.singleArrow.y2)-_this.newScale(item.singleArrow.y1))*this.playTimeRatio
            })
            .delay((d,i)=>{
                let item = this.actions[i]
                return (_this.newScale(item.singleArrow.y1)-progressH)*playTimeRatio
            })
            .attr('opacity', (n,i)=>{
                if(ifBeforeProgress(i)){
                    return 1
                }else{
                    if(playAction==='play') {
                        return 1
                    }else{
                        return 0
                    }
                }
            })
        this.canvas.selectAll('.t-start-guides-l')
            .attr('y1', n=>_this.newScale(n.startGuides.y1))
            .attr('y2', n=>_this.newScale(n.startGuides.y2))
        this.canvas.selectAll('.t-end-guides-l')
            .attr('y1', n=>_this.newScale(n.endGuides.y1))
            .attr('y2', n=>_this.newScale(n.endGuides.y2))
        this.canvas.selectAll('.t-start-guides-o-c')
            .attr('cy', n=>_this.newScale(n.startGuides.y2))
        this.canvas.selectAll('.t-start-guides-c')
            .attr('cy', n=>_this.newScale(n.startGuides.y2))
        this.canvas.selectAll('.t-end-guides-o-c')
            .attr('cy', n=>_this.newScale(n.endGuides.y2))
        this.canvas.selectAll('.t-end-guides-c')
            .attr('cy', n=>_this.newScale(n.endGuides.y2))
    }

    clearCanvas(){
        this.canvas.selectAll('.t-arrow')
        // .data(this.actions).enter()
            .attr('x1', n=>n.readyAnimate.x)
            .attr('y1', n=>n.readyAnimate.y)
            .attr('x2', n=>n.readyAnimate.x)
            .attr('y2', n=>n.readyAnimate.y)
            .attr('marker-end', 'none')
        this.canvas.selectAll('.guides')
            .attr('opacity', 0)
            .transition()
    }
    updateTooltip(){
        // console.log(`this.tooltip is: ${JSON.stringify(this.tooltip)}`)
        d3.select('#tooltip')
            .style('left', `${this.tooltip.x+this.tooltip.offset}px`)
            .style('top', `${this.tooltip.y+this.tooltip.offset}px`)
            .style('display', this.tooltip.show?'block':'none')
            .text(this.tooltip.text)
    }
    /**
     * 传入开始高度或自动设置开始高度
     */
    setAutoPosition(){
        this.x = this.canvasWidth/2-this.width/2
        const boundWidth = this.lineWidth/2
        this.startPointX = this.x+boundWidth
        this.endPointX = this.x+this.width-boundWidth

        this.y = this.canvasHeight/2-this.height/2
    }
    setOption(config){
        if(config.backgroundColor) {
            this.backgroundColor = config.backgroundColor
            this.canvas.style('background-color', this.backgroundColor)
        }
    }
    setCoefficient(coefficient: number){
        this.coefficient = coefficient
    }

    setData(data, minTime?: number, maxTime?: number){
        this.data = data

        if(minTime!==null&&minTime!==undefined) {
            this.minTime = minTime
            this.maxTime = maxTime
        }else{
            let firstDateList = data.map(n=>n.firstDate)
            let secondDateList = data.map(n=>n.secondDate)
            let allDate = firstDateList.concat(secondDateList)
            // console.log(`allDate is: ${JSON.stringify(allDate)}`)
            this.minTime = min(allDate)
            this.maxTime = max(allDate)
            // console.log(`this.minTime is: ${JSON.stringify(this.minTime)}`)
            // console.log(`this.maxTime is: ${JSON.stringify(this.maxTime)}`)
        }
    }
    setHighlight(selectionId){
        const _this = this
        if(selectionId) {
            console.log(`selectionId is: ${JSON.stringify(selectionId)}`)
            console.log(`this.actions is: ${JSON.stringify(this.actions)}`)
            let foundActiveIdx = findIndex(this.actions, n=>n.active===true)
            if(foundActiveIdx!==-1) {
                this.actions[foundActiveIdx].active = false
            }
            let foundIndex = findIndex(this.actions, n=>n.id===selectionId)
            console.log(`foundIndex is: ${JSON.stringify(foundIndex)}`)
            this.actions[foundIndex].active = true
            let activeAction = this.actions[foundIndex]
            this.actions.splice(foundIndex,1)
            this.actions.push(activeAction)
            console.log(`this.actions is: ${JSON.stringify(this.actions)}`)
            // console.log(`this.actions is: ${JSON.stringify(this.actions)}`)
            // this.canvas.select(`#arrow${selectionId}`).attr('class', 't-arrow active')
            // this.canvas.selectAll(`.t-arrow`)
            //     .style('stroke', n=>{
            //         if(n.direction===Direction.A_TO_B) {
            //             return Color.Send
            //         }else{
            //             return Color.Receive
            //         }
            //     })
            //     .attr('marker-end', n=>n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)')
            // this.canvas.selectAll('.t-arrow.active').attr('class', 't-arrow')

            let arrow = this.canvas.select(`#arrow${selectionId}`)
            //     .attr('class', 't-arrow active')
                // .style('stroke', Color.Active)
                // .attr('marker-end', 'url(#arrowActive)')
            // console.log(`arrow is: ${JSON.stringify(arrow)}`)
            arrow.select(function(){
                document.querySelector('#canvas').appendChild(this.parentNode)
            })
            this.canvas.selectAll('.t-arrow')
                .style('stroke', n=>{
                    console.log(`n.active is: ${JSON.stringify(n.active)}`)
                    if(n.active) {
                        console.log(`n.active is: ${JSON.stringify(n.active)}`)
                        console.log(Color.Active)
                        return Color.Active
                    }
                    if(n.direction===Direction.A_TO_B) {
                        return Color.Send
                    }else{
                        return Color.Receive
                    }
                })

            this.setNewProgress(this.progress)
        }else{
            this.canvas.selectAll('.t-arrow').attr('class', 't-arrow')
        }
    }

    processData(type){
        // let granularity = 20
        // if(this.data.length<granularity) {
        if(this.minTime!==undefined&&this.minTime!==null) {
            this.diffTime = this.maxTime - this.minTime
        }
        // console.log(`diffTime is: ${JSON.stringify(this.diffTime)}`)
        // 根据最小和最大时间差比上最小时间轴高度求出缩放倍数
        this.timeRate = this.diffTime/this.height
        // }

        let totalY = 0
        this.timeLineData = this.data.map((n,idx)=> {
            let firstY, secondY
            if(this.minTime!==undefined&&this.minTime!==null) {
                firstY = n.firstDate - this.minTime
                secondY = n.secondDate - this.minTime
            }
            firstY = firstY/this.timeRate
            secondY = secondY/this.timeRate

            totalY += firstY
            totalY += secondY

            // firstY += this.y
            // secondY += this.y
            return {id: n.id, direction: n.direction, firstY: firstY, secondY: secondY}
        })
        // console.log(`this.timeLineData is: ${JSON.stringify(this.timeLineData)}`)
        let yTotal = 0
        let timeDiffs = []
        this.timeLineData.forEach(n=>{
            yTotal+=n.firstY
            const firstYPercent = yTotal/totalY*100
            yTotal+=n.secondY
            const secondYPercent = yTotal/totalY*100
            n.firstYPercent = firstYPercent
            n.secondYPercent = secondYPercent
            timeDiffs.push(n.secondY-n.firstY)
        })
        // console.log(`timeDiffs is: ${JSON.stringify(timeDiffs)}`)
        const minDiff = min(timeDiffs.filter(n=>n>0))
        // console.log(`minDiff is: ${JSON.stringify(minDiff)}`)
        let zoomRatio = 1
        // console.log(`this.initScalable is: ${JSON.stringify(this.initScalable)}`)
        if(this.initScalable) {
            const minH = 4 //最小像素差高度
            let tempZoomRatio = minH/minDiff
            if(tempZoomRatio>1) zoomRatio = tempZoomRatio
        }
        // console.log(`zoomRatio is: ${JSON.stringify(zoomRatio)}`)
        // this.scale = d3.scaleLinear().domain([0,10]).range([0,10*zoomRatio])
        this.scale = d3.scaleLinear().domain([0,this.diffTime]).range([0,this.diffTime])

        // this.playTimeRatio = (this.diffTime/1000/this.height)*3000
        this.playTimeRatio = this.diffTime/this.scale(this.height)*this.coefficient
        // console.log(`playTimeRatio is: ${JSON.stringify(this.playTimeRatio)}`)

        this.timeLineData.forEach(n=>{
            this.addAction(n.id, n.direction, n.firstY, n.secondY)
        })
        this.updateBaseLine()
    }

    updateBaseLine(){
        this.lineData.forEach(n=>{
            n.y1 = this.scale(n.y1)
            n.y2 = this.scale(n.y2)
        })
        this.renderBaseLine()
    }

    private addAction(id: any, direction: Direction, firstY: number, secondY: number){
        let sa
        // 设置开始参考线和结束参考线
        let startGuides, endGuides, readyAnimate

        firstY = this.scale(firstY)
        secondY = this.scale(secondY)
        if(direction===Direction.A_TO_B) {
            const width = this.endPointX-4-this.startPointX
            // console.log(` wid: ${this.endPointX-4-this.startPointX}`)
            // console.log(`-------`)
            // console.log(`width is: ${JSON.stringify(width)}`)
            const height = secondY-firstY
            // console.log(`height is: ${JSON.stringify(height)}`)
            // console.log(`width is: ${JSON.stringify(width)}`)
            // console.log(`height is: ${JSON.stringify(height)}`)
            let angle = 0
            if(height) {
                const actualWidth = width+4
                // console.log(`actualWidth is: ${JSON.stringify(actualWidth)}`)
                angle = Math.atan(height/actualWidth)*180/Math.PI
                // console.log(`angle a to b is: ${JSON.stringify(angle)}`)
                // console.log(`a is: ${JSON.stringify(a)}`)
                // console.log(`height is: ${JSON.stringify(height)}`)
                // const arrowLength = Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2))
                // angle = Math.asin(height/arrowLength)* 180 / Math.PI
            }

            readyAnimate = new ReadyAnimate(this.startPointX, firstY)
            sa = new SingleArrow(this.startPointX, firstY, this.endPointX-4, secondY, angle, Color.Send)

            // console.log(`this.timelineWidth is: ${JSON.stringify(this.timelineWidth)}`)
            startGuides = new Guides(this.startPointX, firstY, this.startPointX+this.guidesWidth-this.boundWidth, firstY, '#D8D8D7')
            endGuides = new Guides(this.endPointX+this.lineWidth, secondY,
                this.endPointX+(this.guidesWidth-this.width)+this.lineWidth-this.boundWidth, secondY, '#D8D8D7')
            // endGuides.setEndPoint(this.endPointX+2+(this.guidesWidth-this.width)+this.timelineWidth, secondY)
        }else{ // b to a
            const width = this.width
            // console.log(`width is: ${JSON.stringify(width)}`)
            const height = secondY-firstY

            // console.log(`height is: ${JSON.stringify(height)}`)
            let angle = 0
            if(height) {
                const arrowLength = Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2))
                angle = Math.asin(height/arrowLength)* 180 / Math.PI
            }
            // console.log(`angle b to a is: ${JSON.stringify(angle)}`)
            // angle = (180-angle*2)/2+90
            // const angle = Math.acos(height/arrowLength)*180/Math.PI
            // console.log(`b to a angle is: ${JSON.stringify(angle)}`)

            readyAnimate = new ReadyAnimate(this.endPointX, firstY)
            sa = new SingleArrow(this.endPointX, firstY, this.startPointX+4, secondY, angle, Color.Receive)
            startGuides = new Guides(this.endPointX+this.lineWidth, firstY,
                this.endPointX+(this.guidesWidth-this.width)+this.lineWidth-this.boundWidth, firstY, '#D8D8D7')
            endGuides = new Guides(this.startPointX, secondY,
                this.startPointX+this.guidesWidth-this.boundWidth, secondY, '#D8D8D7')
        }
        this.actions.push({id: id, direction: direction, active: false, readyAnimate: readyAnimate, singleArrow: sa, startGuides: startGuides, endGuides: endGuides})
        this.oActions.push({id: id, direction: direction, active: false, readyAnimate: readyAnimate, singleArrow: sa, startGuides: startGuides, endGuides: endGuides})
    }

    render(){
        const guidesOpacity = .8
        this.processData('showBatch')
        // console.log(`this.actions is: ${JSON.stringify(this.actions)}`)
        // this.actions.forEach(n=> {
        //     n.readyAnimate.y = n.readyAnimate.y+this.y
        //     n.singleArrow.y1 = n.singleArrow.y1+this.y
        //     n.singleArrow.y2 = n.singleArrow.y2+this.y
        //     n.startGuides.y1 = n.startGuides.y1+this.y
        //     n.startGuides.y2 = n.startGuides.y2+this.y
        //     n.endGuides.y1 = n.endGuides.y1+this.y
        //     n.endGuides.y2 = n.endGuides.y2+this.y
        // })
        this.yZoom = d3.zoom()
            // .scaleExtent([1, 10])
            .on("zoom", zoomed);

        const _this = this
        function zoomed() {
            // console.log(`d3.event.transform.k is: ${JSON.stringify(d3.event.transform.k)}`)
            // console.log(`d3.event.transform.x is: ${JSON.stringify(d3.event.transform.x)}`)
            // console.log("translate(" + d3.event.transform  + ")scale(" + d3.event.transform + ")")
            // circles_group.attr("transform",
            //     "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            // d3.select(this).attr("transform",
            //     "translate(" + d3.event.transform.x+","+ d3.event.transform.y + ") scale(" + d3.event.transform.k+","+ d3.event.transform.k + ")");
            // _this.canvas.selectAll('.tlg, .t-start-guides-g')
            //     .attr("transform",
            //     // ["translate(" + 0+","+ d3.event.transform.y + ")", `scale(1, ${d3.event.transform.k})`].join(""))
            //     ["translate(" + 0+","+ d3.event.transform.y + ")"].join(""))
            let Y = d3.event.transform.rescaleY(_this.scale)
            _this.newScale = Y

            _this.canvas.selectAll('.tl')
                .attr('y1', n=>{
                    return Y(n.y1)
                })
                .attr('y2', n=>Y(n.y2))
// console.log(`_this.newScale(1) is: ${JSON.stringify(_this.newScale(1))}`)
            // _this.actions.forEach((n,i)=>{
            //     n.singleArrow.y1 = Y(_this.oActions[i].singleArrow.y1)
            //     n.singleArrow.y2 = Y(_this.oActions[i].singleArrow.y2)
            // })
            // _this.canvas.selectAll('.t-arrow, .guides').interrupt()
            // _this.setProgress(_this.progress, _this.progressType)
            // _this.playAction = 'pause'
            _this.setNewProgress(_this.progress)
            // _this.canvas.selectAll('.t-arrow, .guides').interrupt()
            // _this.canvas.selectAll('.t-arrow')
            //     .attr('y1', n=>this.newScale(n.readyAnimate.y))
            //     .attr('y2', n=>this.newScale(n.singleArrow.y2))
            // _this.canvas.selectAll('.guides')
        }

        // dimensions
        var margin = {top: 0, bottom: 0},
            svg_dy = 500,
            chart_dy = svg_dy - margin.top - margin.bottom;


        // let scale = d3.scaleLinear().domain([0,10]).range([0,11])

        // data
        var y = d3.randomNormal(400, 100);
        var x_jitter = d3.randomUniform(0, 100);

        var d = d3.range(750)
            .map(function() {
                return [x_jitter(), y()];
            });

        // console.log(`chart_dy is: ${JSON.stringify(chart_dy)}`)
        // y position
        var yScale = d3.scaleLinear()
            .domain(d3.extent(d, function(d) { return d[1]; }))
            .range([chart_dy, margin.top]);

        // console.log(`d[1] is: ${JSON.stringify(d[1])}`)
        // console.log(`yScale is: ${JSON.stringify(yScale(20))}`)
        // function zoomed() {
        //     // re-draw circles using new y-axis scale; ref [3]
        //     // var new_yScale = d3.event.transform.rescaleY(yScale);
        //     // d3.selectAll('.t-arrow').attr("y1", function(d) {
        //     //     // console.log(`d[1] is: ${JSON.stringify(d[1])}`)
        //     //     return new_yScale(20); }).attr("y2", function(d) {
        //     //     // console.log(`d[1] is: ${JSON.stringify(d[1])}`)
        //     //     return new_yScale(20); })
        //
        //     // _this.canvas.selectAll('.t-arrow')
        //     //     .attr('y1', n=>_this.scale(n.singleArrow.y1))
        //     //     .attr('y2', n=>_this.scale(n.singleArrow.y2))
        //     // d3.event.transform.rescaleY
        //     var new_yScale = d3.event.transform.rescaleY(yScale);
        //     console.log(new_yScale)
        //     // d3.selectAll('.t-arrow').attr("y1", function(d) { return new_yScale(d[1]);});
        //     console.log(`d3.event.transform is: ${JSON.stringify(d3.event.transform)}`)
        //     console.log(`d3.event.transform.rescaleY(yScale) is: ${JSON.stringify(d3.event.transform.rescaleY(yScale))}`)
        // }

        this.canvas.call(this.yZoom)
        // let diff = this.maxTime-this.minTime
        // console.log(`this.actions is: ${JSON.stringify(this.actions)}`)
        let tStartGuidesCGroup = this.canvas.selectAll('.t-start-guides-g')
            .data(this.actions).enter().append('g').attr('class', 't-start-guides-g')
        let guidesG = tStartGuidesCGroup.append('g').attr('class', 'guides')
            .attr('timeDiff', (n,idx)=>this.data[idx].secondDate-this.data[idx].firstDate)

        guidesG.append('line')
            .attr('class', 't-start-guides-l')
            .style('stroke', n=>n.startGuides.color)
            .style('stroke-width', 1)
            .attr('x1', n=>n.startGuides.x1)
            .attr('y1', n=>n.startGuides.y1)
            .attr('x2', n=>n.startGuides.x2)
            .attr('y2', n=>n.startGuides.y2)
            .attr('opacity', guidesOpacity)
            .attr('stroke-dasharray', '2,2')
        guidesG.append('circle')
            .attr('class', 't-start-guides-o-c')
            .attr('cx', n=>n.startGuides.x2)
            .attr('cy', n=>n.startGuides.y2)
            .attr('r', 6)
            .attr('opacity', 0)
            .attr('fill', '#ffffff05')
            .attr('stroke', '#fff')
        guidesG
            .append('circle')
            .attr('class', 't-start-guides-c')
            .attr('cx', n=>n.startGuides.x2)
            .attr('cy', n=>n.startGuides.y2)
            .attr('r', 4)
            .attr('fill', this.primaryColor)

        // let tEndGuidesCGroup = this.canvas.selectAll('t-end-guides-g')
        //     .data(this.actions).enter().append('g')
        guidesG.append('line')
            .attr('class', 't-end-guides-l')
            .style('stroke', n=>n.endGuides.color)
            .style('stroke-width', 1)
            .attr('x1', n=>n.endGuides.x1)
            .attr('y1', n=>n.endGuides.y1)
            .attr('x2', n=>n.endGuides.x2)
            .attr('y2', n=>n.endGuides.y2)
            .attr('opacity', guidesOpacity)
            .attr('stroke-dasharray', '2,2')

        guidesG.append('circle')
            .attr('class', 't-end-guides-o-c')
            .attr('cx', n=>n.endGuides.x2)
            .attr('cy', n=>n.endGuides.y2)
            .attr('r', 6)
            .attr('opacity', 0)
            .attr('fill', '#ffffff05')
            .attr('stroke', '#fff')
        guidesG
            .append('circle')
            .attr('class', 't-end-guides-c')
            .attr('cx', n=>n.endGuides.x2)
            .attr('cy', n=>n.endGuides.y2)
            .attr('r', 4)
            .attr('fill', this.primaryColor)

        tStartGuidesCGroup.append('line')
            .attr('id', n=>'arrow'+n.id)
            .attr('class', 't-arrow')
            .style('stroke', n=>n.singleArrow.color)
            .style('stroke-width', 1)
            .attr('x1', n=>n.singleArrow.x1)
            .attr('y1', n=>n.singleArrow.y1)
            .attr('x2', n=>n.singleArrow.x2)
            .attr('y2', n=>n.singleArrow.y2)
            .attr('marker-end', n=>n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)')

        this.canvas.selectAll('.t-start-guides-g').on('mousemove', ()=>{
            const timeDiff = d3.event.toElement.parentElement.getAttribute('timeDiff')
            _this.tooltip.show = true
            _this.tooltip.text = `时差: ${timeDiff}`
            const x = d3.event.pageX
            const y = d3.event.pageY
            if(_this.tooltip.show) {
                _this.tooltip.x = x
                _this.tooltip.y = y
                _this.updateTooltip()
            }
        }).on('mouseout', ()=>{
            _this.tooltip.show = false
            _this.updateTooltip()
        })
        this.progress = 100
    }

}
