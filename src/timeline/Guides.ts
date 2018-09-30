import Shape from "../topology/Shape";
import {active} from "d3-transition";
import {OFFSET_Y_ANIMATION_MODE} from "./MyConstant";

interface ActiveLine {
    firstY: number
    secondY: number
}
export default class Guides extends Shape{
    private endPoint = {x: 0, y: 0}
    private hover: boolean = false
    private active: boolean = false
    pointStyle: string
    hoverStyle: string = '#04A7F1'
    activeStyle: string = '#A5DE46'
    activeLine: ActiveLine
    activeRadius: number = 8
    constructor(canvas: HTMLCanvasElement, startX:number, startY: number, strokeStyle?: string){
        super(canvas, startX, startY)
        this.strokeStyle = strokeStyle
    }
    setEndPoint(x, y){
        this.endPoint.x = x
        this.endPoint.y = y
    }
    setActiveLine(activeLine: ActiveLine){
        this.activeLine = activeLine
    }
    setEndPointHeight(y){
        this.endPoint.y = y
    }
    setHover(hover: boolean){
        this.hover = hover
    }
    setActive(active: boolean){
        this.active = active
    }
    setZoomInTimes(times: number){
        this.zoomInTimes = times
    }
    render(){
        // console.log(`this.zoomInTimes is: ${JSON.stringify(this.zoomInTimes)}`)
        this.ctx.save()
        this.ctx.beginPath()
        let lineDash = [2, 2]
        if(this.hover||this.active) {
            lineDash = [3, 1]
        }
        if(this.offsetYAnimationMode===OFFSET_Y_ANIMATION_MODE.noAnimate) {
            this.animateOffsetY = this.offsetY
        }
        this.ctx.setLineDash(lineDash)
        this.ctx.moveTo(this.x, this.y*this.zoomInTimes+this.animateOffsetY)

        // console.log(`this.animateOffsetY is: ${JSON.stringify(this.animateOffsetY)}`)
        const animateOffsetYDiff = Math.floor(this.offsetY-this.animateOffsetY)
        // console.log(`animateOffsetYDiff is: ${JSON.stringify(animateOffsetYDiff)}`)
        if (animateOffsetYDiff!==0) {
            if (animateOffsetYDiff > 0) {
                this.animateOffsetY++
            } else if (animateOffsetYDiff < 0) {
                this.animateOffsetY--
            }
        }
        // this.ctx.lineTo(this.endPoint.x, this.endPoint.y*this.zoomInTimes+this.offsetY)
        this.ctx.lineTo(this.endPoint.x, this.endPoint.y*this.zoomInTimes+this.animateOffsetY)
        if(this.lineWidth){
            this.ctx.lineWidth = this.lineWidth
        }
        if(this.fillStyle) {
            this.ctx.fillStyle = this.fillStyle
            this.ctx.fill()
        }
        if(this.strokeStyle) {
            let style = this.strokeStyle
            if(this.hover) {
                style = '#fff'
            }
            this.ctx.strokeStyle = style
            this.ctx.stroke()
        }
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.restore()


        // console.log(`this.endPoint.x is: ${JSON.stringify(this.endPoint.x)}`)
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.arc(this.endPoint.x, this.endPoint.y*this.zoomInTimes+this.animateOffsetY, 4, 0, 2*Math.PI)
        if(this.pointStyle) {
            let style = this.pointStyle
            if(this.active) {
                style = this.activeStyle
            }else if(this.hover) {
                style = this.hoverStyle
            }
            this.ctx.fillStyle = style
            this.ctx.strokeStyle = style
        }
        this.ctx.fill()
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.restore()
        if(this.hover||this.active) { // 画线点和线
            this.ctx.save()
            this.ctx.beginPath()
            this.ctx.arc(this.endPoint.x, this.endPoint.y*this.zoomInTimes+this.animateOffsetY, this.activeRadius, 0, 2*Math.PI)

            // console.log(`this.activeLine is: ${JSON.stringify(this.activeLine)}`)
            if(this.activeLine) {
                const activeLineStartY = this.activeLine.firstY+this.activeRadius
                const activeLineEndY = this.activeLine.secondY-this.activeRadius
                this.ctx.moveTo(this.endPoint.x, activeLineStartY)
                this.ctx.lineTo(this.endPoint.x, activeLineEndY)
                // console.log(`this.activeLine.firstY is: ${JSON.stringify(this.activeLine.firstY)}`)
            }

            this.ctx.strokeStyle = '#fff'
            this.ctx.stroke()
            this.ctx.closePath()
            this.ctx.restore()
        }
    }

}