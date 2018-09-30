import Line from "./Line";
import {random, min, max, minBy, maxBy, sortedUniqBy, sortBy} from "lodash";
import SingleArrow from "./SingleArrow";
import {Direction} from "./Direction";
import {ANIMATION_MODE, OFFSET_Y_ANIMATION_MODE, OPERATE_ACTION} from "./MyConstant";
import {AnimateAction} from "./AnimateAction";
import Guides from "./Guides";
import Tooltip from "./Tooltip";
import {Point} from "./MyInterfaces";
interface Action{
    direction: Direction,
    firstY: number,
    secondY: number,
    color: string
}
enum Color{
    Send = '#FA744B',
    Receive = '#A5DE46'
}
enum Mode{
    showAll = 1,
    showBatch = 2
}
// interface dataOption{
//     type: string, // time || height
//     data: Array<Action>
// }
interface SectionLine{
    start: number
    end: number
}
interface ArrowLine{
    singleArrow: SingleArrow
    startGuides: Guides
    endGuides: Guides
}
export default class TimelinePacket{
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D // canvas context
    y: number
    width: number
    arrowLineWidth: number
    timeRate: number
    height: number
    initHeight: number // 用于reset，清空后reset
    startPointX: number
    endPointX: number
    private offsetY: number = 0
    autoOffsetY: number = 10 // 当新增线条后的最高展示超过屏幕后适配后到底部的偏移量
    animateOffsetY: number
    primaryColor: string
    tooltip: Tooltip
    line1: Line
    line2: Line
    guidesLine: Line
    guidesLineEndPointX: number
    timelineWidth: number = 1
    guidesWidth: number = 300
    diffTime: number
    minTime: number
    maxTime: number
    actions: Array<ArrowLine> = []
    sortByGuidesActions: Array<ArrowLine> = []
    backgroundColor: string = '#2F3243'
    mode: number
    playAction: number = AnimateAction.pause

    totalLength: number // 总长度，用来计算进度
    linesObjList: Array<SectionLine>
    progressRatio: number // 进度倍率
    progress: number
    progressEndRender = {
        active: false,
        endIndex: null,
        endLength: null
    }

    private detectionPoint: Point

    fps: number = 60 // 帧率

    private data: Array<{direction: number, firstDate: number, secondDate: number}> = []

    private zoomInTimes: number = 1
    constructor(canvas, x, width, height, strokeStyle?, startPointY?){
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.width = width
        this.height = height
        this.initHeight = height
        this.startPointX = x+1
        this.setStartY(startPointY)
        // this.y = startPointY
        this.endPointX = x+width-1
        this.primaryColor = strokeStyle
        this.line1 = new Line(canvas, x, this.y, strokeStyle)
        this.line1.setEndPoint(x, this.y+height)
        this.line2 = new Line(canvas, x+width, this.y, strokeStyle)
        this.line2.setEndPoint(x+width, this.y+height)
        this.guidesLineEndPointX = x+this.guidesWidth+2.5
        this.guidesLine = new Line(canvas, this.guidesLineEndPointX, this.y, '#585765')
        this.guidesLine.setEndPoint(this.guidesLineEndPointX, this.y+height)

        this.tooltip = new Tooltip(canvas, 120, 50, )
        // console.log(`x+this.guidesWidth is: ${JSON.stringify(x+this.guidesWidth)}`)
        this.init()
    }
    init(){
        // this.progressEndRender.endLength =20
        // console.log(`this.progressEndRender is: ${JSON.stringify(this.progressEndRender)}`)
    }

    setProgress(progress: number) {
        const _this = this
        if(this.playAction===AnimateAction.play) {
            this.playAction = AnimateAction.pause
        }
        this.progress = progress
        // this.clearAction()
        // console.log(`linesObjList is: ${JSON.stringify(this.linesObjList)}`)
        console.log(`this.totalLength is: ${JSON.stringify(this.totalLength)}`)
        // console.log(`progress is: ${JSON.stringify(progress)}`)
        const animateLength = this.totalLength*progress/100
        console.log(`animateLength is totalLength*progress/100: ${JSON.stringify(animateLength)}`)
        this.linesObjList.forEach((n,idx)=>{
            if(animateLength>=n.start&&animateLength<=n.end) {
                // console.log(`idx is: ${JSON.stringify(idx)}`)
                _this.progressEndRender.active = true
                _this.progressEndRender.endIndex = idx
                let endLength
                if(idx) {
                    // endLength = n.end-animateLength
                    endLength = animateLength-n.start
                }else{
                    endLength = animateLength
                }
                _this.progressEndRender.endLength = endLength
            }
        })
        this.actions.forEach(n=>{
            n.singleArrow.updateLength()
        })
        this.render()
        console.log(`this.progressEndRender is: ${JSON.stringify(this.progressEndRender)}`)
    }
    setPlayAction(playAction: number){
        this.playAction = playAction
        this.actions.forEach((n, idx)=>{
            if(this.progressEndRender.active) {
                if(idx>=this.progressEndRender.endIndex) {
                    n.singleArrow.isAnimateDone = false
                }
                if(idx>this.progressEndRender.endIndex) {
                    n.singleArrow.animateArrowEndLength = 0
                    n.singleArrow.animateLength = 0
                }
                n.singleArrow.updateLength()
            }
        })

        if(playAction===AnimateAction.play) {
            this.progressEndRender.active = false
        }else{
            this.progressEndRender.active = true
        }
        // else{
        //     this.setProgress(this.progress)
        //     // console.log(`pause this.progress is: ${JSON.stringify(this.progress)}`)
        // }
    }
    /*相对于line1的开始x的width*/
    setGuidesX(width: number){
        this.guidesWidth = width
    }
    setDetectionPoint(point: Point, action: OPERATE_ACTION){
        this.detectionPoint = point
        if(action===OPERATE_ACTION.move) {
            this.handleMoveDetectionPoint(point)
        }else if(action===OPERATE_ACTION.click) {
            this.handleClickDetectionPoint(point)
        }
    }
    handleMoveDetectionPoint(point: Point){
        const actions = this.actions
        let foundActions = []
        actions.forEach(n=>{
            n.singleArrow.setHover(false)
            n.startGuides.setHover(false)
            n.endGuides.setHover(false)
        })
        for(let i=0;i<actions.length;i++) {
            const action = actions[i]
            // 找出参考线矩形区域
            // this.startPointX
            // this.guidesLineEndPointX
            // action.startGuides.y
            // action.endGuides.y
            const firstY = action.startGuides.y*this.zoomInTimes+this.offsetY
            const secondY = action.endGuides.y*this.zoomInTimes+this.offsetY
            if(
                point.x>=this.startPointX&&point.x<=this.guidesLineEndPointX+action.startGuides.activeRadius&&
                point.y>=firstY&&point.y<= secondY
            ) {
                foundActions.push(action)
            }else if(Math.sqrt(Math.pow(point.x-this.guidesLineEndPointX, 2)+Math.pow(point.y-firstY, 2))<action.startGuides.activeRadius) {
                foundActions.push(action)
            }else if(Math.sqrt(Math.pow(point.x-this.guidesLineEndPointX, 2)+Math.pow(point.y-secondY, 2))<action.startGuides.activeRadius) {
                foundActions.push(action)
            }
            // else{
            //     action.startGuides.setHover(false)
            //     action.endGuides.setHover(false)
            // }
        }
        // console.log(`foundActions.length is: ${JSON.stringify(foundActions.length)}`)
        // let sortedActions = sortBy(foundActions, (o)=>{return o.startGuides.y})
        const foundAction = maxBy(foundActions, (o)=>o.startGuides.y)
        if(foundAction) {

            // console.log(`foundAction is: ${foundAction}`)
            const firstY = foundAction.startGuides.y*this.zoomInTimes+this.offsetY
            const secondY = foundAction.endGuides.y*this.zoomInTimes+this.offsetY
            const minY = min([firstY, secondY])
            const maxY = max([firstY, secondY])
            foundAction.startGuides.setActiveLine({firstY: minY, secondY: maxY})
            foundAction.singleArrow.setHover(true)
            foundAction.startGuides.setHover(true)
            foundAction.endGuides.setHover(true)
            this.sortByGuidesActions = sortBy(this.actions, (o)=>o.singleArrow.id===foundAction.singleArrow.id)
            // console.log(`newActions is: ${JSON.stringify(newActions)}`)
            // console.log(`this.timeRate is: ${JSON.stringify(this.timeRate)}`)
            const firstDate = (foundAction.singleArrow.y-this.y)*this.timeRate+this.minTime
            const secondDate = (foundAction.singleArrow.endPoint.y-this.y)*this.timeRate+this.minTime

            // console.log(`firstDate is: ${firstDate}, secondDate is: ${secondDate}`)
            this.tooltip.setVisible(true)
            this.tooltip.updateInfo({x: point.x+20, y: point.y+20}, `时间差: ${secondDate-firstDate}`)
        }else{
            this.tooltip.setVisible(false)
        }
    }
    handleClickDetectionPoint(point: Point){
        return
        const actions = this.actions
        let foundGuides
        for(let i=0;i<actions.length;i++) {
            const action = actions[i]
            // 找出参考线矩形区域
            // this.startPointX
            // this.guidesLineEndPointX
            // action.startGuides.y
            // action.endGuides.y
            const firstY = action.startGuides.y*this.zoomInTimes+this.offsetY
            const secondY = action.endGuides.y*this.zoomInTimes+this.offsetY
            const guides = [
                {guides: action.startGuides, y: firstY},
                {guides: action.endGuides, y: secondY}
            ]
            for(let j=0;j<guides.length;j++) {
                if(Math.sqrt(Math.pow(point.x-this.guidesLineEndPointX, 2)+Math.pow(point.y-guides[j].y, 2))<action.startGuides.activeRadius) {
                    foundGuides = guides[j]
                }
            }
            if(foundGuides) break

            // if(
            //     point.x>=this.startPointX&&point.x<=this.guidesLineEndPointX+action.startGuides.activeRadius&&
            //     point.y>=firstY&&point.y<= secondY
            // ) {
            //     foundGuides = action
            //     break
            //     // console.log('找到一个区域: '+[i])
            //     // const minY = min([firstY, secondY])
            //     // const maxY = max([firstY, secondY])
            //     // console.log(`min an max: ${minY}, ${maxY}`)
            //     // action.startGuides.setActiveLine({firstY: minY, secondY: maxY})
            //     // action.startGuides.setHover(true)
            //     // action.endGuides.setHover(true)
            // }
        }
        if(foundGuides) {
            console.log('find a guides...')
            foundGuides.guides.setActive(true)
            // console.log(foundGuides)
        }
        // foundAction
    }

    // getDetectionPoint(){
    //     return this.detectionPoint
    // }
    setTimeLineWidth(width: number){
        this.timelineWidth = width
        this.line1.lineWidth = width
        this.line2.lineWidth = width
        this.startPointX += width/2
        this.endPointX -= width/2
    }
    setTimeLength(minTime: number, maxTime: number){
        this.minTime = minTime
        this.maxTime = maxTime
    }
    setArrowLineWidth(width: number){
        this.arrowLineWidth = width
    }

    /**
     * 传入开始高度或自动设置开始高度
     */
    setStartY(startHeight){
        if(typeof startHeight === 'number') {
            this.y = startHeight
        }else if(typeof startHeight === 'string'){

        }else{
            this.y = this.canvas.height/2-this.height/2
        }
        // console.log(`this.y is: ${JSON.stringify(this.y)}`)
    }
    setOffsetAnimateMode(offsetYAnimationMode?: OFFSET_Y_ANIMATION_MODE){
        this.line1.setOffsetYAnimationMode(offsetYAnimationMode)
        this.line2.setOffsetYAnimationMode(offsetYAnimationMode)
        this.guidesLine.setOffsetYAnimationMode(offsetYAnimationMode)
        this.actions.forEach(n=>{
            n.singleArrow.setOffsetYAnimationMode(offsetYAnimationMode)
            n.startGuides.setOffsetYAnimationMode(offsetYAnimationMode)
            n.endGuides.setOffsetYAnimationMode(offsetYAnimationMode)
        })
    }
    setOffsetY(offsetY: number){
        this.offsetY = offsetY
        this.line1.setOffsetY(offsetY)
        this.line2.setOffsetY(offsetY)
        this.guidesLine.setOffsetY(offsetY)
        this.actions.forEach(n=>{
            n.singleArrow.setOffsetY(offsetY)
            n.startGuides.setOffsetY(offsetY)
            n.endGuides.setOffsetY(offsetY)
        })
    }
    addOffsetY(y: number){
        this.offsetY+=y
        this.setOffsetY(this.offsetY)
    }
    showAllAction(data){
        // this.data = data
        // this.mode = Mode.showAll
        return this.processData(data, 'showBatch')
    }
    showAddAction(data: object){
        return this.processData([data], 'showAdd')
    }
    showBatchAction(data: Array<object>){
        this.mode = Mode.showBatch
        return this.processData(data, 'showBatch')
    }
    processData(data, type){
        this.data = data
        this.totalLength = 0
        let timeLineData
        // let granularity = 20
        // if(this.data.length<granularity) {
            if(this.minTime) {
                this.diffTime = this.maxTime - this.minTime
            }
            // 根据最小和最大时间差比上最小时间轴高度求出缩放倍数
            this.timeRate = this.diffTime/this.height
        // }

        timeLineData = this.data.map((n,idx)=> {
            let firstY, secondY
            if(this.minTime) {
                firstY = n.firstDate - this.minTime
                secondY = n.secondDate - this.minTime
            }
            firstY = firstY/this.timeRate
            secondY = secondY/this.timeRate
            firstY += this.y
            secondY += this.y
            let action = this.actions[idx]
            if(idx!==this.data.length-1) {
                if(action) {
                    this.updateAction(action.singleArrow, n.direction, firstY, secondY)
                }
            }
            return {direction: n.direction, firstY: firstY, secondY: secondY}
        })

        // const lastData = timeLineData[timeLineData.length-1]
        if(type==='showBatch') {
            this.clearAction()
        }
        let linesObjList = [], linesList = []
        timeLineData.forEach((n,idx)=>{
            const reachedLength = this.addAction(n.direction, n.firstY, n.secondY)
            linesList.push(reachedLength)
            let start = 0
            if(idx) {
                // start = linesList[idx-1]+1
                start = linesList[idx-1]
            }
            linesObjList.push({start: start, end: reachedLength})
        })
        // console.log(`this.actions is: ${JSON.stringify(this.actions)}`)
        this.linesObjList = linesObjList
        // console.log(`linesObjList is: ${JSON.stringify(linesObjList)}`)
        this.progressRatio = this.totalLength/100
        // console.log(`totalLength is: ${JSON.stringify(Math.floor(this.totalLength))}`)
        // console.log(`this.progressRatio is: ${JSON.stringify(this.progressRatio)}`)
        return {offset: this.offsetY-this.autoOffsetY}
    }

    updateAction(arrow: SingleArrow, direction: Direction, firstY: number, secondY: number){
        if(direction===Direction.A_TO_B) {
            // sa = new SingleArrow(this.canvas, this.startPointX, firstY, Color.Send)
            arrow.setStartPoint(this.startPointX, firstY)
            arrow.setEndPoint(this.endPointX, secondY)
        }else{
            // sa = new SingleArrow(this.canvas, this.endPointX, firstY, Color.Receive)
            arrow.setStartPoint(this.endPointX, firstY)
            arrow.setEndPoint(this.startPointX, secondY)
        }
        arrow.setOffsetY(this.offsetY)
    }

    clearAction(){
        this.data = []
        this.actions.splice(0, this.actions.length)
        // this.setOffsetY(0)
        // this.height = this.initHeight
        // this.updateTimeLineHeight(this.height)
    }
    private addAction(direction: Direction, firstY: number, secondY: number){
        let sa, arrowTotalLength = 0

        // 设置开始参考线和结束参考线
        let startGuides, endGuides

        if(direction===Direction.A_TO_B) {
            sa = new SingleArrow(this.canvas, this.startPointX, firstY, Color.Send)
            arrowTotalLength = sa.setEndPoint(this.endPointX, secondY)

            // console.log(`this.timelineWidth is: ${JSON.stringify(this.timelineWidth)}`)
            startGuides = new Guides(this.canvas, this.startPointX, firstY, '#D8D8D7')
            startGuides.pointStyle = this.primaryColor
            startGuides.setEndPoint(this.startPointX+this.guidesWidth, firstY)
            endGuides = new Guides(this.canvas, this.endPointX+2+this.timelineWidth, secondY, '#D8D8D7')
            endGuides.pointStyle = this.primaryColor
            endGuides.setEndPoint(this.endPointX+2+(this.guidesWidth-this.width)+this.timelineWidth, secondY)
        }else{ // b to a
            sa = new SingleArrow(this.canvas, this.endPointX, firstY, Color.Receive)
            arrowTotalLength = sa.setEndPoint(this.startPointX, secondY)

            startGuides = new Guides(this.canvas, this.endPointX+2+this.timelineWidth, firstY, '#D8D8D7')
            startGuides.pointStyle = this.primaryColor
            startGuides.setEndPoint(this.endPointX+2+(this.guidesWidth-this.width)+this.timelineWidth, firstY)
            endGuides = new Guides(this.canvas, this.startPointX, secondY, '#D8D8D7')
            endGuides.pointStyle = this.primaryColor
            endGuides.setEndPoint(this.startPointX+this.guidesWidth, secondY)
        }
        this.totalLength+=arrowTotalLength
        sa.setLineWidth(this.arrowLineWidth)
        sa.setOffsetY(this.offsetY)
        sa.syncAnimateOffsetY()
        // sa.updateAngle()
        sa.setZoomInTimes(this.zoomInTimes)
        if(this.mode===Mode.showAll) {
            sa.animationMode = ANIMATION_MODE.noAnimate
        }else {
            sa.animationMode = ANIMATION_MODE.animate
        }

        this.actions.push({singleArrow: sa, startGuides: startGuides, endGuides: endGuides})
        return this.totalLength
    }
    updateTimeLineHeight(height){
        this.line1.setEndPointHeight(height)
        this.line2.setEndPointHeight(height)
        this.guidesLine.setEndPointHeight(height)
    }
    updateZoomIn(times: number){
        this.zoomInTimes = times
        console.log(`this.zoomInTimes is: ${JSON.stringify(this.zoomInTimes)}`)
        this.line1.setZoomInTimes(times)
        this.line2.setZoomInTimes(times)
        this.guidesLine.setZoomInTimes(times)
        this.actions.forEach(n=>{
            n.singleArrow.setZoomInTimes(times)
            n.startGuides.setZoomInTimes(times)
            n.endGuides.setZoomInTimes(times)
        })
        this.render()
    }

    render(){
        // this.ctx.clearRect(0,-10, this.canvas.width, this.canvas.height+10)
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)

        this.ctx.save()
        this.ctx.fillStyle = this.backgroundColor
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.restore()

        // this.line1.y = this.y
        this.line1.render()
        // this.line2.y = this.y
        this.line2.render()
        // this.guidesLine.y = this.y
        this.guidesLine.render()
        // console.log(`this.guidesLine is: ${JSON.stringify(this.guidesLine)}`)
        let retInfo = this.renderAction()
        // if(this.playAction===AnimateAction.play) {
        //     this.updateProgressEnd
        // }
        this.tooltip.render()
        return retInfo
    }
    renderAction(){
        let isAllDone = false
        let totalAnimatedLength = 0

        // console.log(`this.playAction is: ${JSON.stringify(this.playAction)}`)
        let actions = this.actions
        let renderedActions = []
        for(let i=0;i<actions.length;i++) {
            let action = actions[i]
            let renderInfo, isProgressReached = false
            if(this.playAction===AnimateAction.play) {
                action.singleArrow.animationMode = ANIMATION_MODE.animate
                if(this.progressEndRender.active&&this.progressEndRender.endIndex===i) {
                    renderInfo = action.singleArrow.render(this.progressEndRender.endLength)
                }else{
                    renderInfo = action.singleArrow.render()
                }
            }else if(this.playAction===AnimateAction.pause) {
                action.singleArrow.animationMode = ANIMATION_MODE.noAnimate
                if(this.progressEndRender.active&&this.progressEndRender.endIndex===i) {
                    renderInfo = action.singleArrow.render(this.progressEndRender.endLength)
                    isProgressReached = true
                }else{
                    renderInfo = action.singleArrow.render()
                }
            }
            if(!this.sortByGuidesActions.length) { // 如果默认没有排序的参考线就一起展示
                action.startGuides.render()
                action.endGuides.render()
            }
            renderedActions.push(action)

            // console.log(`renderInfo.isAnimateDone is: ${JSON.stringify(renderInfo.isAnimateDone)}`)
            totalAnimatedLength+=renderInfo.animatedLength
            if(isProgressReached) break
            if(!renderInfo.isAnimateDone) {
                break
            }else{
                if(i===actions.length-1) isAllDone = true
            }
        }

        this.sortByGuidesActions.forEach(action=>{
            renderedActions.forEach(rAction=>{
                if(action===rAction) {
                    action.startGuides.render()
                    action.endGuides.render()
                }
            })
        })
        this.progress = totalAnimatedLength/this.progressRatio
        return {
            isAllDone: isAllDone,
            progress: this.progress
        }
    }
}