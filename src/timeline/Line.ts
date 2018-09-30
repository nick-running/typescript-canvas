import Shape from "../topology/Shape";
import {OFFSET_Y_ANIMATION_MODE} from "./MyConstant";

export default class Line extends Shape{
    private endPoint = {x: 0, y: 0}
    private animateEndPoint = {x: 0, y: 0}
    constructor(canvas: HTMLCanvasElement, startX:number, startY: number, strokeStyle?: string){
        super(canvas, startX, startY)
        this.strokeStyle = strokeStyle
    }
    setEndPoint(x, y){
        this.endPoint.x = x
        this.endPoint.y = y
    }
    setEndPointHeight(y){
        this.endPoint.y = y
    }
    setZoomInTimes(times: number){
        this.zoomInTimes = times
    }
    render(){
        // console.log(`this.zoomInTimes is: ${JSON.stringify(this.zoomInTimes)}`)
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.moveTo(this.x, this.y*this.zoomInTimes+this.animateOffsetY)

        // console.log(`this.offsetYAnimationMode is: ${JSON.stringify(this.offsetYAnimationMode)}`)
        if(this.offsetYAnimationMode===OFFSET_Y_ANIMATION_MODE.noAnimate) {
            this.animateOffsetY = this.offsetY
        }
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
            this.ctx.strokeStyle = this.strokeStyle
            this.ctx.stroke()
        }
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.restore()
    }
}