import Shape from "./Shape";

export default class SingleArrow extends Shape{
    x1: number
    y1: number
    x2: number
    y2: number
    px: number // progress x
    py: number // progress y
    angle: number
    constructor(x1: number, y1: number, x2: number, y2,
                px: number, py: number, angle: number, color?: string){
        super(color)
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.px = px
        this.py = py
        this.angle = angle
        this.color = color
    }
}