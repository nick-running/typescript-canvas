import * as d3 from "d3";
import {Color} from "../Api/MyEnum";
import {min, max, find, findIndex} from 'lodash'
import {Direction} from "../timeline/Direction";
import SingleArrow from "../svgTimeline2/SingleArrow";
import Guides from "../svgTimeline2/Guides";
import {Emitter} from "./Emitter";
class Tooltip{
    show: boolean = false // hover over的show
    activeShow: boolean = false // 总是展示设置
    x: number = 0
    y: number = 0
    offset: number = 15
    text: string
}
class Info {
	source: string
	target: string
}
export {Emitter}
export default class Timeline2{
    private x: number
    private y: number
    private boundWidth: number
    private primaryColor: string
    private svg: any
    private timelinePanel: any
    private svgWidth: number
    private svgHeight: number
    private backgroundColor: string // svg background
		private info = new Info()
    private width: number
    private height: number
    private lineColor: string
    private lineWidth: number
    private startPointX: number
    private endPointX: number
    private guidesWidth: number = 300

    private lineData: Array<{
    	x1: number, y1: number,
	    x2: number, y2: number,
	    lineWidth: number,
	    text?: string
    }>
    private timeLineData: Array<{id: any, direction: number, firstY: number, secondY: number,
	    text?: string,
        firstYPercent?:number, secondYPercent?:number,
        activeFirstY?: any, activeSecondY?: any}> = []
    private data: Array<{id: any, direction: number,
        firstDate: number, secondDate: number,
	    text?: string,
	    activeFirstDate: boolean, activeSecondDate: boolean,
        }> = []
    private minTime: number
    private maxTime: number
    private timeRate: number
    private playTimeRatio: number
    private coefficient: number = 1
    private diffTime: number
    private actions: Array<any> = []
    // private oActions: Array<any> = []

    scale: any
    newScale: any
    yZoom: any
    yPanelZoom: any

    tooltip: Tooltip = new Tooltip()
    playAction: string = 'play'
    progress: number
    /**
     * @param {number} x timeline开始x
     * @param {number} width timeline宽度
     * @param {number} height timeline高度
     * @param {string} lineColor timeline line的颜色
     * @param {number} lineWidth timeline line的宽度
     * @param {boolean} initScalable 是否初始放大到合适位置
     */
    constructor(svg: string, x: any, width: number, height: number, lineColor: string,
                lineWidth?: number, initScalable?: boolean){
        this.svg = d3.select(svg)
        this.timelinePanel = this.svg.append('g')
            .attr('class', 'timeline-panel')
        this.width = width
        this.height = height
        this.lineColor = lineColor
        this.primaryColor = lineColor

        if(lineWidth) this.lineWidth = lineWidth
        this.boundWidth = lineWidth/2
        if(typeof x ==='number') {
            this.x = x
            this.startPointX = this.x+this.boundWidth
            this.endPointX = this.x+this.width-this.boundWidth
        }else if(typeof x ==='string') {
            if(x==='auto') {
                this.svgWidth = this.svg.attr('width')
                this.svgHeight = this.svg.attr('height')
                this.x = this.svgWidth/2-this.width/2
                this.startPointX = this.x+this.boundWidth
                this.endPointX = this.x+this.width-this.boundWidth
                // this.y = this.svgHeight/2-this.height/2
            }else {
                this.x = 0
                this.startPointX = this.x+this.boundWidth
                this.endPointX = this.x+this.width-this.boundWidth
            }
        }
        this.init()
    }
    private init(){
        this.scale = d3.scaleLinear().domain([0,10]).range([0,10])
        this.newScale = this.scale

        let defs = this.timelinePanel.append("defs")
        this.generateArrowMarker("arrowSend", defs, Color.Send)
        this.generateArrowMarker("arrowReceive", defs, Color.Receive)
        this.generateArrowMarker("arrowActive", defs, Color.Active)
        d3.select('body').append('div')
            .attr('id', 'tooltip')
            .style('top', '0')
            .style('left', '0')
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.5)')
            .style('width', '140px')
            .style('height', '60px')
            .style('color', '#fff')
            .style('padding', '5px')
            .style('border-radius', '4px')
            .style('display', 'none')
            .style('z-index', '10')
            .text('0')
    }
    private generateArrowMarker(id, defs, color){
        let arrowPath = "M2,2 L2,11 L10,6 L2,2";
        let arrowMarker = defs.append("marker")
            .attr("id",id)
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","12")
            .attr("markerHeight","12")
            .attr("viewBox","0 0 12 12")
            .attr("refX","6")
            .attr("refY","6")
            .attr("orient","auto")
        arrowMarker.append("path")
            .attr("d", arrowPath)
            .attr("fill", color)
    }
    startMove(){
        // this.timelinePanel
        //     .transition()
        //     .ease(d3.easeLinear)
        //     .duration(2000)
        //     .attr('transform', `translate(0, ${this.svgHeight/2-this.height/2})`)
        // this.timelinePanel.transition()
        //     .ease(d3.easeLinear).duration(750).call(this.yPanelZoom.translateTo, 0, 200)
        // this.timelinePanel.transition().duration(100).call(this.yPanelZoom.transform, d3.zoomIdentity);
    }
    setPlayAction(playAction){
        this.svg.selectAll('.t-arrow, .guides').interrupt()
        this.playAction = playAction
        if(playAction==='play') {
            this.setData(this.data)
            this.render()
        }else{
            this.timelinePanel.selectAll('.t-arrow, .guides').interrupt()
        }
    }
    private updateTooltip(){
        // console.log(`this.tooltip is: ${JSON.stringify(this.tooltip)}`)
        d3.select('#tooltip')
            .style('left', `${this.tooltip.x+this.tooltip.offset}px`)
            .style('top', `${this.tooltip.y+this.tooltip.offset}px`)
            .style('display', (this.tooltip.show||this.tooltip.activeShow)?'block':'none')
            .text(this.tooltip.text)
    }
    setOption(config){
        if(config.backgroundColor) {
            this.backgroundColor = config.backgroundColor
            this.svg.style('background-color', this.backgroundColor)
        }
	    if (config.info) {
	    	this.info.source = config.info.source
	    	this.info.target = config.info.target
	    }
    }
    setCoefficient(coefficient: number){
        this.coefficient = coefficient
    }
    setProgress(progress){
        this.progress = progress
        this.setData(this.data)
    }
    timeUnit(time){
        let value = time/1000
        let val = ''
        if(value<1){
            val = time+'微秒'
        }else{
            val = value.toFixed(2)+'毫秒'
        }
        return val
    }
    setData(data, minTime?: number, maxTime?: number){
        // console.log(`data is: ${JSON.stringify(data)}`)
        this.data = data
        const startY = 0
        this.y = startY
        if(this.progress===undefined) this.progress = 100
        this.lineData = [
            {
            	x1: this.x, y1: startY,
	            x2: this.x, y2: startY+this.height,
	            lineWidth: this.lineWidth,
	            text: this.info.source
            },
            {
            	x1: this.x+this.width, y1: startY,
	            x2: this.x+this.width, y2: startY+this.height,
	            lineWidth: this.lineWidth,
	            text: this.info.target
            },
            {x1: this.x+this.guidesWidth, y1: startY, x2: this.x+this.guidesWidth, y2: startY+this.height, lineWidth: 1},
        ]
        if(minTime!==null&&minTime!==undefined) {
            this.minTime = minTime
            this.maxTime = maxTime
        }else{
            let firstDateList = data.map(n=>n.firstDate)
            let secondDateList = data.map(n=>n.secondDate)
            let allDate = firstDateList.concat(secondDateList)
            this.minTime = min(allDate)
            this.maxTime = max(allDate)
        }

        // 数据处理
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

            let activeFirstY, activeSecondY
            // console.log(`n.activeDate is: ${JSON.stringify(n.activeFirstDate)}`)
            if(n.activeFirstDate) {
                activeFirstY = firstY
            }
            if(n.activeSecondDate) {
                activeSecondY = secondY
            }
            return {
            	id: n.id,
	            direction: n.direction,
	            firstY: firstY,
	            secondY: secondY,
	            activeFirstY: activeFirstY,
	            activeSecondY: activeSecondY,
	            text: n.text
            }
        })
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
        this.scale = d3.scaleLinear().domain([0, this.diffTime]).range([0,this.diffTime])

        this.playTimeRatio = this.diffTime/this.scale(this.height)*this.coefficient
        this.actions = []
        // this.oActions = []
        this.timeLineData.forEach(n=>{
            this.addAction(
            	n.id,
	            n.direction,
	            n.firstY, n.secondY,
	            n.activeFirstY, n.activeSecondY,
	            n.text
            )
        })
    }
    private addAction(id: any, direction: Direction, firstY: number, secondY: number,
                      activeFirstY: number, activeSecondY: number, text: string){
        let sa
        // 设置开始参考线和结束参考线
        let startGuides, endGuides
        const progressH = this.height*this.progress/100 // 进度到达高度
        // console.log(`progressH is: ${JSON.stringify(progressH)}`)
        // firstY = this.scale(firstY)
        // secondY = this.scale(secondY)
        // console.log(`firstY is: ${JSON.stringify(firstY)}`)
        // console.log(`secondY is: ${JSON.stringify(secondY)}`)
        let getProgressHeight = function (firstY, targetY) {
            let py = targetY
            if(progressH>firstY&&progressH<secondY){
                py = progressH
            }else if(progressH>=targetY){
                py = targetY
            }else{
                py = firstY
            }
            return py
        }
        // 根据进度计算到达高度
        let py = getProgressHeight(firstY, secondY)
        let startGuidesActive = null, endGuidesActive = null
        // console.log(`activeY is: ${JSON.stringify(activeY)}`)
        // console.log(`firstY is: ${JSON.stringify(firstY)}`)
        // console.log(`secondY is: ${JSON.stringify(secondY)}`)
        // console.log('In addAction...')
        // console.log(`activeFirstY is: ${JSON.stringify(activeFirstY)}`)
        // console.log(`activeSecondY is: ${JSON.stringify(activeSecondY)}`)
        if(this.newScale(activeFirstY)===this.newScale(firstY)) {
            startGuidesActive = true
        }
        if(this.newScale(activeSecondY)===this.newScale(secondY)) {
            endGuidesActive = true
        }
        // console.log(`startGuidesActive is: ${JSON.stringify(startGuidesActive)}`)
        // console.log(`endGuidesActive is: ${JSON.stringify(endGuidesActive)}`)
        // console.log('****************************************]')

        if(direction===Direction.A_TO_B) {
            const endX = this.endPointX-4
            const width = endX-this.startPointX
            const height = secondY-firstY
            let angle = 0
            if(height) {
                const actualWidth = width+4
                angle = Math.atan(height/actualWidth)*180/Math.PI
            }
            let px
            if(progressH>firstY&&progressH<secondY){
                const x = (progressH-firstY)/Math.tan(angle*Math.PI/180)
                px = x+this.x
            }else if(progressH>=secondY){
                px = endX
            }else if(progressH<secondY){
                px = this.startPointX
            }
            // console.log(`A to b px is: ${JSON.stringify(px)}`)
            sa = new SingleArrow(this.startPointX, firstY, endX, secondY, px, py, angle, Color.Send)
            startGuides = new Guides(this.startPointX, firstY, this.startPointX+this.guidesWidth-this.boundWidth, firstY,
                '#D8D8D7', startGuidesActive)
            endGuides = new Guides(this.endPointX+this.lineWidth, secondY,
                this.endPointX+(this.guidesWidth-this.width)+this.lineWidth-this.boundWidth, secondY, '#D8D8D7', endGuidesActive)
        }else{ // B to A
            const width = this.width
            const height = secondY-firstY
            let angle = 0
            if(height) {
                const arrowLength = Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2))
                angle = Math.asin(height/arrowLength)* 180 / Math.PI
            }

            let px
            const lineHeight = (progressH-firstY)
            if(progressH>firstY&&progressH<secondY){
                const x = lineHeight/Math.tan(angle*Math.PI/180)
                px = this.endPointX-x+8
            }else if(progressH>=secondY){
                px = this.startPointX+4
            }else if(progressH<secondY){
                px = this.endPointX
            }
            // console.log(`B to a px is: ${JSON.stringify(px)}`)
            sa = new SingleArrow(this.endPointX, firstY, this.startPointX+4, secondY, px, py, angle, Color.Receive)
            startGuides = new Guides(this.endPointX+this.lineWidth, firstY,
                this.endPointX+(this.guidesWidth-this.width)+this.lineWidth-this.boundWidth, firstY, '#D8D8D7',
                startGuidesActive)
            endGuides = new Guides(this.startPointX, secondY,
                this.startPointX+this.guidesWidth-this.boundWidth, secondY, '#D8D8D7', endGuidesActive)
        }
        this.actions.push({
	        id: id, direction: direction,
	        active: false, singleArrow: sa,
	        startGuides: startGuides, endGuides: endGuides,
	        text: text
        })
        // this.oActions.push({id: id, direction: direction, active: false, singleArrow: sa, startGuides: startGuides, endGuides: endGuides})
    }

    render(){
        const _this = this
        // console.log(`render...`)
        // console.log(`_this.data is: ${JSON.stringify(_this.data)}`)
        // console.log(`this.y is: ${JSON.stringify(this.y)}`)
        // console.log(`progress is: ${JSON.stringify(this.progress)}`)
        const progressH = this.newScale(this.height*this.progress/100) // 进度到达高度
        // console.log(`progressH is: ${JSON.stringify(progressH)}`)

        const guidesOpacity = .8
        this.yZoom = d3.zoom()
            .scaleExtent([1, 10])
            // .translateExtent([[0, 0], [0, 300]]) // 移动的范围
            .on("zoom", zoomed);
        this.yPanelZoom = d3.zoom()
            .scaleExtent([1, 10])
            // .translateExtent([[0,0], [areaWidth, areaHeight]])//移动的范围
            .on("zoom", panelZoomed);

        function panelZoomed(){
            var transform = d3.event.transform;
            // console.log(`transform...`)
            // console.log(transform)
            _this.timelinePanel
                .transition()
                .ease(d3.easeLinear)
                .duration(750)
                .attr('transform', `translate(0, ${transform.y})`)
        }

        function zoomed() {
            // console.log('zoomed...')
            // console.log(`d3.event.transform.k is: ${JSON.stringify(d3.event.transform.k)}`)
            // console.log(`d3.event.transform.x is: ${JSON.stringify(d3.event.transform.x)}`)
            // console.log("translate(" + d3.event.transform  + ")scale(" + d3.event.transform + ")")
            // circles_group.attr("transform",
            //     "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            // d3.select(this).attr("transform",
            //     "translate(" + d3.event.transform.x+","+ d3.event.transform.y + ") scale(" + d3.event.transform.k+","+ d3.event.transform.k + ")");
            // _this.canvas.selectAll('.tlg, .t-line-g')
            //     .attr("transform",
            //     // ["translate(" + 0+","+ d3.event.transform.y + ")", `scale(1, ${d3.event.transform.k})`].join(""))
            //     ["translate(" + 0+","+ d3.event.transform.y + ")"].join(""))
            let Y = d3.event.transform.rescaleY(_this.scale)
            _this.newScale = Y

            // _this.timelinePanel.selectAll('.lg')
            //     .attr('y1', n=>{
            //         return Y(n.y1)
            //     })
            //     .attr('y2', n=>Y(n.y2))

            // _this.actions.forEach((n,i)=>{
            //     n.singleArrow.y1 = Y(_this.oActions[i].singleArrow.y1)
            //     n.singleArrow.y2 = Y(_this.oActions[i].singleArrow.y2)
            // })
            _this.playAction = 'pause'
            _this.svg.selectAll('.t-arrow, .guides').interrupt()
            _this.setData(_this.data)
            _this.render()
            Emitter.fire("interruptProgress", "pause", _this.progress);
            // _this.setProgress(_this.progress, _this.progressType)
            // _this.setNewProgress(_this.progress)
            // _this.canvas.selectAll('.t-arrow, .guides').interrupt()
            // _this.canvas.selectAll('.t-arrow')
            //     .attr('y1', n=>this.newScale(n.readyAnimate.y))
            //     .attr('y2', n=>this.newScale(n.singleArrow.y2))
            // _this.canvas.selectAll('.guides')
        }
        this.svg.call(this.yZoom)
        this.svg.on('click', function () {
            _this.data.forEach(n=>{
                n.activeFirstDate=null
                n.activeSecondDate=null
            })
            _this.tooltip.activeShow = false
            _this.updateTooltip()
            _this.setData(_this.data)
            _this.render()
        })
        // this.timelinePanel.call(this.yPanelZoom)

        let tlG = this.timelinePanel.selectAll('.tlg')
            .data([1]).enter()
            .append('g').attr('class', 'tlg')

        let lg = tlG.selectAll('.lg').data(this.lineData)

        this.timelinePanel
	          .selectAll('.lg')
	          .data(this.lineData)
            .attr('y1', n=>_this.newScale(n.y1))
            .attr('y2', n=>_this.newScale(n.y2))

        lg.enter().append('line')
            .attr('class', 'lg')
            .style('stroke', this.lineColor)
            .style('stroke-width', n=>n.lineWidth)
            .attr('x1', n=>n.x1)
            .attr('y1', n=>_this.newScale(n.y1))
            .attr('x2', n=>n.x2)
            .attr('y2', n=>_this.newScale(n.y2))

	    this.timelinePanel
		    .selectAll('.lg-text')
		    .data(this.lineData)
		    .attr('y', n=>_this.newScale(n.y2)+20)

        lg.enter().append('text')
            .attr('class', 'lg-text')
            .style('fill', '#ffffff')
	          .attr('text-anchor', 'middle')
            // .style('stroke-width', n=>n.lineWidth)
            .attr('x', n=>n.x1)
            .attr('y', n=>_this.newScale(n.y2)+20)
	          .text(d=>d.text)


        // 初始化时的自动高度
        this.timelinePanel
            .transition()
            .ease(d3.easeLinear)
            .duration(2000)
            .attr('transform', `translate(0, ${this.svgHeight/2-this.height/2})`)

        // console.log(`render this.actions is: ${JSON.stringify(this.actions)}`)
        // let diff = this.maxTime-this.minTime
        let tGroup = this.timelinePanel.selectAll('.t-line-g')
            .data(this.actions, d=>d.id)

        let tLineGroupEnter = tGroup.enter()
            .append('g')
            .attr('class', 't-line-g')
            .attr('timeDiff', (n,idx)=>this.data[idx].secondDate-this.data[idx].firstDate)

        let tLineArrowEnter = tLineGroupEnter.append('line')
            .attr('id', n=>'arrow'+n.id)
            .attr('class', 't-arrow')
            .style('stroke', n=>n.singleArrow.color)
            .style('stroke-width', 1)
            .attr('x1', n=>n.singleArrow.x1)
            .attr('y1', n=>_this.newScale(n.singleArrow.y1))
            .attr('x2', n=>n.singleArrow.px)
            .attr('y2', n=>_this.newScale(n.singleArrow.py))
            // .attr('marker-end', n=>n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)')
            .attr('marker-end', n=>{
                if(progressH>_this.newScale(n.singleArrow.y1)&&progressH<_this.newScale(n.singleArrow.py)){
                    if(n.active) return 'url(#arrowActive)'
                    return n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)'
                }else if(progressH<_this.newScale(n.singleArrow.py)){
                    return 'none'
                }else if(progressH>=_this.newScale(n.singleArrow.py)) {
                    if(n.active) return 'url(#arrowActive)'
                    return n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)'
                }
            })

        let tLineArrowUpdate = tGroup.selectAll('.t-arrow') // update部分
            .data(this.actions, d=>d.id)
            .attr('y1', n=>_this.newScale(n.singleArrow.y1))
            .attr('x2', n=>n.singleArrow.px)
            .attr('y2', n=>_this.newScale(n.singleArrow.py))
            .attr('marker-end', n=>{
                if(progressH>_this.newScale(n.singleArrow.y1)&&progressH<_this.newScale(n.singleArrow.py)){
                    if(n.active) return 'url(#arrowActive)'
                    return n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)'
                }else if(progressH<_this.newScale(n.singleArrow.py)) {
                    return 'none'
                }else if(progressH>=_this.newScale(n.singleArrow.py)) {
                    if(n.active) return 'url(#arrowActive)'
                    return n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)'
                }
            })

	    let tLineTextEnter = tLineGroupEnter.append('text')
		    .attr('id', n=>'lineText'+n.id)
		    .attr('class', 't-line-text')
		    .style('fill', '#ffffff')
		    .attr('text-anchor', 'middle')
		    .attr('font-size', '12')
		    .attr('x', n=>(n.singleArrow.px-n.singleArrow.x1)/2+n.singleArrow.x1)
		    .attr('y', n=>(_this.newScale(n.singleArrow.py)-_this.newScale(n.singleArrow.y1))/2+_this.newScale(n.singleArrow.y1)-20)
		    .text(n=>n.text)

	    tGroup.selectAll('.t-line-text') // update部分
		    .data(this.actions, d=>d.id)
		    .attr('x', n=>(n.singleArrow.px-n.singleArrow.x1)/2+n.singleArrow.x1)
		    .attr('y', n=>(_this.newScale(n.singleArrow.py)-_this.newScale(n.singleArrow.y1))/2+_this.newScale(n.singleArrow.y1)-20)
		    .text(n=>n.text)


        // 点击激活显示事件
        let findActivedList = function () {
            let activedList = []
            _this.data.forEach((n)=>{
                if(n.activeFirstDate) {
                    activedList.push(n.firstDate)
                }
                if(n.activeSecondDate) {
                    activedList.push(n.secondDate)
                }
            })
            return activedList
        }
        let hookActiveEvent = function (data, index) {
            d3.event.stopPropagation()
            // console.log(`data is: ${JSON.stringify(data)}`)
            if(findActivedList().length>=2) {
                // console.log('overlay')
                _this.data.forEach(n=>{
                    n.activeFirstDate=null
                    n.activeSecondDate=null
                })
            }else{
                // console.log('not overlay')
            }
            // if(activedList.length<2) {
                // console.log(`_this.data is: ${JSON.stringify(_this.data)}`)
                let y = d3.event.target.getAttribute('cy')
                console.log(`clicked active y is: ${JSON.stringify(y)}`)
                if(y===_this.newScale(_this.actions[index].startGuides.y2).toString()) {
                    _this.data[index].activeFirstDate = true
                    // _this.actions[index].startGuides.active = true
                }else{
                    _this.data[index].activeSecondDate = true
                    // _this.actions[index].endGuides.active = true
                }
            // }
            _this.setData(_this.data)
            _this.render()
            if(findActivedList().length===2) {
                _this.tooltip.activeShow = true
                console.log('show tooltip...')
                console.log(`_this.data is: ${JSON.stringify(_this.data)}`)
                let timeDiff = findActivedList().reduce((p,c)=>p-c)
                _this.tooltip.text = `总时差: ${_this.timeUnit(Math.abs(timeDiff))}`
                _this.updateTooltip()
                console.log(`timeDiff is: ${JSON.stringify(timeDiff)}`)
            }else{
                _this.tooltip.activeShow = false
            }
        }
        /******************参考线和点分割************************/
        tLineGroupEnter.append('line')
            .attr('class', 't-start-guides-l')
            .style('stroke', n=>n.startGuides.color)
            .style('stroke-width', 1)
            .attr('x1', n=>n.startGuides.x1)
            .attr('y1', n=>_this.newScale(n.startGuides.y1))
            .attr('x2', n=>n.startGuides.x2)
            .attr('y2', n=>_this.newScale(n.startGuides.y2))
            .attr('opacity', guidesOpacity)
            .attr('stroke-dasharray', '2,2')

        tGroup.selectAll('.t-start-guides-l') // update 部分
            .attr('y1', n=>_this.newScale(n.startGuides.y1))
            .attr('y2', n=>_this.newScale(n.startGuides.y2))

        tLineGroupEnter.append('circle')
            .attr('class', 't-start-guides-o-c')
            .attr('cx', n=>n.startGuides.x2)
            .attr('cy', n=>_this.newScale(n.startGuides.y2))
            .attr('r', 6)
            .attr('opacity', 0)
            .attr('fill', '#ffffff05')
            .attr('stroke', '#fff')
            .on('click', hookActiveEvent)

        tGroup.selectAll('.t-start-guides-o-c') // update 部分
            .data(this.actions, d=>d.id)
            .attr('cy', n=>_this.newScale(n.startGuides.y2))
            // .attr('fill', d=>d.startGuides.active?Color.Active: this.primaryColor)

        // console.log(`_this.actions is: ${JSON.stringify(_this.actions)}`)
        tLineGroupEnter
            .append('circle')
            .attr('class', 't-start-guides-c')
            .attr('cx', n=>n.startGuides.x2)
            .attr('cy', n=>_this.newScale(n.startGuides.y2))
            .attr('r', 4)
            .attr('fill', this.primaryColor)
            .on('click', hookActiveEvent)
        // tStartGuidesC.call('on', 'click', hookActiveEvent)


        tGroup.selectAll('.t-start-guides-c') // update 部分
            .data(this.actions, d=>d.id)
            .attr('cy', n=>_this.newScale(n.startGuides.y2))
            .attr('fill', d=>d.startGuides.active?Color.Active: this.primaryColor)

        tLineGroupEnter.append('line')
            .attr('class', 't-end-guides-l')
            .style('stroke', n=>n.endGuides.color)
            .style('stroke-width', 1)
            .attr('x1', n=>n.endGuides.x1)
            .attr('y1', n=>_this.newScale(n.endGuides.y1))
            .attr('x2', n=>n.endGuides.x2)
            .attr('y2', n=>_this.newScale(n.endGuides.y2))
            .attr('opacity', guidesOpacity)
            .attr('stroke-dasharray', '2,2')

        tGroup.selectAll('.t-end-guides-l') // update 部分
            .attr('y1', n=>_this.newScale(n.endGuides.y1))
            .attr('y2', n=>_this.newScale(n.endGuides.y2))

        tLineGroupEnter.append('circle')
            .attr('class', 't-end-guides-o-c')
            .attr('cx', n=>n.endGuides.x2)
            .attr('cy', n=>_this.newScale(n.endGuides.y2))
            .attr('r', 6)
            .attr('opacity', 0)
            .attr('fill', '#ffffff05')
            .attr('stroke', '#fff')
            .on('click', hookActiveEvent)

        tGroup.selectAll('.t-end-guides-o-c') // update 部分
            .attr('cy', n=>_this.newScale(n.endGuides.y2))
            // .attr('fill', d=>d.endGuides.active?Color.Active: this.primaryColor)

        tLineGroupEnter
            .append('circle')
            .attr('class', 't-end-guides-c')
            .attr('cx', n=>n.endGuides.x2)
            .attr('cy', n=>_this.newScale(n.endGuides.y2))
            .attr('r', 4)
            .attr('fill', this.primaryColor)
            .on('click', hookActiveEvent)

        tGroup.selectAll('.t-end-guides-c') // update 部分
            .data(this.actions, d=>d.id)
            .attr('cy', n=>_this.newScale(n.endGuides.y2))
            .attr('fill', d=>d.endGuides.active?Color.Active: this.primaryColor)


        tLineGroupEnter.on('mousemove', ()=>{
            const timeDiff = d3.event.toElement.parentElement.getAttribute('timeDiff')
            _this.tooltip.show = true
            const x = d3.event.pageX
            const y = d3.event.pageY
            if(!_this.tooltip.activeShow&&_this.tooltip.show) {
                _this.tooltip.text = `时差: ${_this.timeUnit(timeDiff)}`
                _this.tooltip.x = x
                _this.tooltip.y = y
                _this.updateTooltip()
            }
        }).on('mouseout', ()=>{
            _this.tooltip.show = false
            _this.updateTooltip()
        })

        tGroup.exit()
            .transition()
            .duration(250)
            .style('opacity', 0)
            .remove()

        if(this.playAction!=='play') return
        // 开始动画
        const tl = _this.svg.select('.lg')
        const ly1H = tl.attr('y1')
        const ly2H = tl.attr('y2')
        const lh = ly2H-ly1H
        this.playTimeRatio = _this.diffTime/lh*_this.coefficient

        startTransition(tLineArrowEnter)
        startTransition(tLineArrowUpdate)

        function startTransition(elements){
            elements.transition()
                .ease(d3.easeLinear)
                .duration((n)=>{
                    const y1 = _this.newScale(n.singleArrow.y1)
                    const y2 = _this.newScale(n.singleArrow.y2)
                    let d
                    if(progressH>=y1&&progressH<y2) { // 画线中间
                        d = ((y2-y1)-(progressH-y1))* _this.playTimeRatio
                    }else if(progressH<y1){
                        d = (y2 - y1)* _this.playTimeRatio
                    }else {
                        d = 0
                    }
                    // console.log(`duration is: ${JSON.stringify(d)}`)
                    return d
                })
                .delay((d,i)=>{
                    let time = (_this.newScale(d.singleArrow.y1) - progressH)* _this.playTimeRatio
                    return time<0?0:time
                })
                .attr('x2', n=>n.singleArrow.x2)
                .attr('y2', n=>_this.newScale(n.singleArrow.y2))
                .attr('marker-end', n=>{
                    if(n.active) return 'url(#arrowActive)'
                    return n.direction===Direction.A_TO_B?'url(#arrowSend)':'url(#arrowReceive)'
                })
                .on('start', function (data, i) {
                    Emitter.fire("highlightStart", data.id);
                    // console.log('start...', JSON.stringify(data))
                })
                .on('end', function repeat(data, i) {
                    Emitter.fire("highlightEnd",  data.id);
                    // console.log('end...', JSON.stringify(data))
                    // console.log(`i is: ${JSON.stringify(i)}`)
                    // _this.playAction = 'pause'
                    // const tl = _this.svg.select('.lg')
                    // const y1H = tl.attr('y1')
                    // const y2H = tl.attr('y2')
                    // const lineH = y2H-y1H

                    // console.log(`_this.newScale(_this.y) is: ${JSON.stringify(_this.newScale(_this.y))}`)
                    // console.log(`lineH is: ${JSON.stringify(lineH)}`)
                    // console.log(`_this.newScale(data.singleArrow.y2) is: ${JSON.stringify(_this.newScale(data.singleArrow.y2))}`)

                    // _this.progress = _this.newScale(data.singleArrow.y2)/lineH*100
                    _this.progress = _this.newScale(data.singleArrow.y2)/_this.newScale(_this.height)*100
                    // console.log(`on end _this.progress is: ${JSON.stringify(_this.progress)}`)
                    if(_this.progress>=100){
                        _this.setData(_this.data)
                        _this.playAction = 'pause'
                    }
                })
                .on("interrupt", function repeat(ev, ev2, ev3) {
                    const tl = _this.svg.select('.lg')
                    const y1H = tl.attr('y1')
                    const y2H = tl.attr('y2')
                    const lineH = y2H-y1H
                    const curProgressH = ev3[ev2].getAttribute('y2') // 当前暂停进度

                    _this.progress = (curProgressH-y1H)/lineH*100
                    // console.log(`p is: ${JSON.stringify(p)}`)
                    // console.log(`curProgressH is: ${JSON.stringify(curProgressH)}`)
                    // // console.log(`_this.height is: ${JSON.stringify(_this.height)}`)
                    // console.log(`y1H is: ${JSON.stringify(y1H)}`)
                    // _this.progress = (curProgressH-_this.y)/_this.height*100
                    // console.log(`interrupt _this.progress is: ${JSON.stringify(_this.progress)}`)
                })
        }

        // this.progress = 100
    }

}