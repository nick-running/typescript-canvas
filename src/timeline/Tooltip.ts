import Shape from "../topology/Shape";
import {Point} from "./MyInterfaces";

export default class Tooltip extends Shape{
    visible: boolean = false
    backgroundColor: string = 'rgba(0, 0, 0, 0.5)'
    w: number
    h: number
    text: string = 'text'

    constructor(canvas: HTMLCanvasElement, w: number, h: number, backgroundColor?: string) {
        super(canvas, 0, 0);
        if(backgroundColor) {
            this.backgroundColor = backgroundColor
        }
        this.w = w
        this.h = h
    }

    setVisible(visible: boolean){
        this.visible = visible
    }

    updateInfo(point: Point, text: string){
        this.x = point.x
        this.y = point.y
        this.text = text
    }

    render(){
        if(!this.visible) return
        // console.log(`this.zoomInTimes is: ${JSON.stringify(this.zoomInTimes)}`)
        this.ctx.save()
        this.ctx.beginPath()
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
        this.ctx.lineTo(this.x+this.w, this.y)
        this.ctx.lineTo(this.x+this.w, this.y+this.h)
        this.ctx.lineTo(this.x, this.y+this.h)
        this.ctx.lineTo(this.x, this.y)
        // this.ctx.lineTo(this.endPoint.x, this.endPoint.y*this.zoomInTimes+this.offsetY)
        // this.ctx.lineTo(this.endPoint.x, this.endPoint.y*this.zoomInTimes+this.animateOffsetY)

        if(this.lineWidth){
            this.ctx.lineWidth = this.lineWidth
        }
        this.ctx.fillStyle = this.backgroundColor
        this.ctx.fill()
        if(this.strokeStyle) {
            this.ctx.strokeStyle = this.strokeStyle
            this.ctx.stroke()
        }
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.restore()

        this.ctx.save()
        this.ctx.font = '40px'
        this.ctx.fillStyle = '#fff'
        this.ctx.fillText(this.text, this.x+15, this.y+25)
        this.ctx.restore()
    }
}