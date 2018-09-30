import Shape from "../topology/Shape";
import LighterColor from '../static/lib/lighterColor'

import {ANIMATION_MODE, OFFSET_Y_ANIMATION_MODE} from "./MyConstant";
function GenNonDuplicateID(randomLength){
    return Number(Math.random().toString().substr(3,randomLength) + Date.now()).toString(36)
}
interface Point{
    x: number,
    y: number
}
export default class SingleArrow extends Shape{
    id: string
    brushDrawPath: Array<Point>
    arrowLength: number = 10
    private hover: boolean = false
    arrowPath: Array<Point> = [
        {x: 0, y: -4},
        {x: 6, y: 0},
        {x: 0, y: 4},
        {x: 0, y: 0},
    ]
    endPoint = {x: 0, y: 0}
    animateEndPoint = {x: 0, y: 0}
    arrowStartPoint = {x: 0, y: 0}
    length: number // 箭头整体长
    animationMode: ANIMATION_MODE
    animateLength: number = 0
    animateVelocity: number = 2
    isAnimateDone: boolean = false
    arrowEndLength: number // 箭开始到箭头结束长
    animateArrowEndLength: number = 0
    angle: number
    constructor(canvas, x, y, strokeStyle){
        super(canvas, x, y)
        this.id = GenNonDuplicateID(10)
        this.fillStyle = strokeStyle
        this.strokeStyle = strokeStyle
        this.animateEndPoint.x = x
        this.animateEndPoint.y = y
        this.init()
    }
    init(){

    }
    setHover(hover: boolean){
        this.hover = hover
    }
    setLineWidth(width){
        this.lineWidth = width
    }
    setStartPoint(x, y){
        this.x = x
        this.y = y
    }
    setEndPoint(x, y){
        this.endPoint.x = x
        this.endPoint.y = y
        this.updateLength()
        return this.length
    }
    adjustArrow(){
        // console.log(`this.length is: ${JSON.stringify(this.length)}`)
        this.arrowEndLength = this.length-6
        // console.log(`this.angle is: ${JSON.stringify(this.angle)}`)
        // console.log(`arrowEndLength is: ${JSON.stringify(arrowEndLength)}`)
        // console.log(`Math.sin(this.angle) is: ${JSON.stringify(Math.sin(this.angle))}`)
        const width = Math.sin((90-this.angle)*Math.PI/180)*this.arrowEndLength
        const height = Math.cos((90-this.angle)*Math.PI/180)*this.arrowEndLength
        // console.log(`height is: ${JSON.stringify(height)}`)
        // console.log(`width is: ${JSON.stringify(width)}`)
        // console.log(`o width is: ${Math.sin((90-this.angle)*Math.PI/180)*this.length}`)
        this.arrowStartPoint.x = this.x+width
        this.arrowStartPoint.y = this.y+height

        // console.log(`this.length is: ${JSON.stringify(this.length)}`)
    }

    updateLength(){
        const width = this.endPoint.x-this.x
        const height = this.endPoint.y-this.y
        this.length = Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2))
        this.angle = Math.asin(height/this.length)* 180 / Math.PI
        if(width<0) {
            this.angle = (180-this.angle*2)/2+90
        }
        this.adjustArrow()
    }
    setZoomInTimes(times: number){
        this.zoomInTimes = times
    }
    updateAngle(){
        // const height = this.endPoint.y-this.y
        // this.angle = Math.asin(height/this.length)* 180 / Math.PI
    }

    render(cutLength?: number){ // cutLength为进度所在的长度
        const _this1 = this
        // console.log(`this.y*this.zoomInTimes is: ${JSON.stringify(this.y*this.zoomInTimes)}`)

        if(this.offsetYAnimationMode===OFFSET_Y_ANIMATION_MODE.noAnimate) {
            this.animateOffsetY = this.offsetY
        }
        if(cutLength!==undefined) {
            this.length = cutLength
            this.arrowEndLength = cutLength-6
        }
        if(this.animationMode===ANIMATION_MODE.noAnimate||cutLength!=undefined) {
            this.animateLength = this.length
            this.animateArrowEndLength = this.arrowEndLength
        }
        this.ctx.save()
        this.ctx.beginPath()
        const animateOffsetYDiff = this.offsetY-this.animateOffsetY
        // console.log(`animateOffsetYDiff is: ${JSON.stringify(animateOffsetYDiff)}`)
        if (animateOffsetYDiff!==0) {
            if (animateOffsetYDiff > 1) {
                this.animateOffsetY++
            } else if (animateOffsetYDiff < 0) {
                this.animateOffsetY--
            }
        }

        let animateLengthDiff = this.length-this.animateLength
        // console.log(`animateLengthDiff is: ${JSON.stringify(animateLengthDiff)}`)
        if (animateLengthDiff > 1) {
            this.animateLength+=this.animateVelocity
        }else if (animateLengthDiff < 0) {
            // this.animateLength-=this.animateVelocity
            this.animateLength = this.length
        }else{
            this.isAnimateDone = true
        }

        let animateArrowEndLengthDiff = this.arrowEndLength-this.animateArrowEndLength
        // console.log(`animateArrowEndLengthDiff is: ${JSON.stringify(animateArrowEndLengthDiff)}`)
        if (animateArrowEndLengthDiff > 1) {
            this.animateArrowEndLength+=this.animateVelocity
        }else if (animateArrowEndLengthDiff < 0) {
            this.animateArrowEndLength = this.arrowEndLength
            // this.animateArrowEndLength-=this.animateVelocity
        }
        // 根据animateLength和angle算x和y
        const animateX = Math.cos(this.angle*Math.PI/180)*this.animateLength
        const animateY = Math.sin(this.angle*Math.PI/180)*this.animateLength

        const animateArrowX = Math.cos(this.angle*Math.PI/180)*this.animateArrowEndLength
        const animateArrowY = Math.sin(this.angle*Math.PI/180)*this.animateArrowEndLength

        this.ctx.moveTo(this.x, this.y*this.zoomInTimes+this.animateOffsetY)
        this.ctx.lineTo(this.x+animateX, (this.y+animateY)*this.zoomInTimes+this.animateOffsetY)

        if(this.lineWidth) {
            this.ctx.lineWidth = this.lineWidth
        }
        // if(this.hover) { // 加阴影
        //     this.ctx.shadowColor = "#000";
        //     this.ctx.shadowOffsetX = 2;
        //     this.ctx.shadowOffsetY = 2;
        //     this.ctx.shadowBlur = 2;
        // }
        if(this.fillStyle) {
            let style = this.fillStyle
            if(this.hover) {
                style = LighterColor(this.fillStyle, 70);
                // console.log(`style is: ${JSON.stringify(style)}`)
            }
            this.ctx.fillStyle = style
            this.ctx.fill()
            this.ctx.strokeStyle = style
            this.ctx.stroke()
        }
        this.ctx.closePath()
        this.ctx.restore()

        this.ctx.save()
        this.ctx.beginPath()
        // console.log(`this.arrowStartPoint.x is: ${JSON.stringify(this.arrowStartPoint.x)}`)
        // this.ctx.translate(this.endPoint.x, this.endPoint.y*this.zoomInTimes+this.offsetY)
        // this.ctx.translate(this.arrowStartPoint.x, this.arrowStartPoint.y*this.zoomInTimes+this.animateOffsetY)
        this.ctx.translate(this.x+animateArrowX, (this.y+animateArrowY)*this.zoomInTimes+this.animateOffsetY)
        this.ctx.moveTo(0, 0)
        this.ctx.rotate(this.angle*Math.PI/180)
        this.arrowPath.forEach(n=>{
            // _this1.ctx.lineTo(this.endPoint.x, (this.endPoint.y+n.y)*this.zoomInTimes+this.offsetY)
            // _this1.ctx.lineTo(n.x, n.y*this.zoomInTimes)
            _this1.ctx.lineTo(n.x, n.y) // 箭头不放大
        })
        if(this.fillStyle) {
            let style = this.fillStyle
            if(this.hover) {
                style = LighterColor(this.fillStyle, 70);
            }
            this.ctx.fillStyle = style
            this.ctx.fill()
            this.ctx.strokeStyle = style
            this.ctx.stroke()
        }
        this.ctx.closePath()
        this.ctx.restore()
        return {
            isAnimateDone: this.isAnimateDone,
            animatedLength: this.animateLength
        }
    }
}