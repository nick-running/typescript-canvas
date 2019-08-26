import Shape from "./Shape";

interface ActiveLine {
    firstY: number
    secondY: number
}
export default class Guides extends Shape{
    x1: number
    y1: number
    x2: number
    y2: number
    pointStyle: string = '#63583F'
    hover: boolean = false
    active: boolean = false
    hoverStyle: string = '#04A7F1'
    activeStyle: string = '#A5DE46'
    activeLine: ActiveLine
    activeRadius: number = 8
    constructor(x1: number, y1: number, x2: number, y2, color?: string, active?: boolean){
        super(color)
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        if(active) this.active = active
    }
}