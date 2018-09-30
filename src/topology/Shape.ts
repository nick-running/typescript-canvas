import RangeObject from "./RangeObject";
import {OFFSET_Y_ANIMATION_MODE} from "../timeline/MyConstant";

interface Animate{
    x: number,
    y: number,
    zoomInTimes: number
}
export default class Shape extends RangeObject{
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D // canvas context
    type: string
    protected offsetY: number = 0
    protected animateOffsetY: number = 0

    x: number = 0 // 开始x
    y: number = 0 // 开始y

    zoomInTimes: number = 1
    offsetYAnimationMode: OFFSET_Y_ANIMATION_MODE

    animate: Animate
    fillStyle: string
    strokeStyle: string
    lineWidth: number
    constructor(canvas: HTMLCanvasElement, x?:number, y?:number){
        super()
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.x = x
        this.y = y
    }
    setOffsetYAnimationMode(offsetYAnimationMode: OFFSET_Y_ANIMATION_MODE){
        this.offsetYAnimationMode = offsetYAnimationMode
    }
    setOffsetY(offsetY: number, offsetYAnimationMode?: OFFSET_Y_ANIMATION_MODE){
        this.offsetY = offsetY
        if(offsetYAnimationMode) {
            this.offsetYAnimationMode = offsetYAnimationMode
        }
    }
    syncAnimateOffsetY(){
        this.animateOffsetY = this.offsetY
    }
}
