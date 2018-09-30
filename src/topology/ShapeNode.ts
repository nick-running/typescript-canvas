import Shape from "./Shape";

export default class ShapeNode extends Shape{
    name: string
    image: HTMLImageElement

    constructor(canvas: HTMLCanvasElement, x:number, y: number, imgSrc: string, strokeStyle?: string){
        super(canvas, x, y)
        if(strokeStyle) this.strokeStyle = strokeStyle
        if(imgSrc){
            let img = new Image()
            img.src = imgSrc
            this.image = img
        }
    }

    checkRange(targetX, targetY, type){
        if((targetX>=this.rangeStartX&&targetX<=this.rangeEndX)&&
            (targetY>=this.rangeStartY&&targetY<=this.rangeEndY)){
            // console.log('clicked target obj is')
            // console.log(obj)
            this.setBgColor('red')
            console.log('entered...')
        }else{
            this.setBgColor('yellow')
            console.log(`移除……`)
        }
    }
    setBgColor(bgColor: string){
        this.strokeStyle = bgColor
        // this.update()
        // console.log(this.curPaintColorLump)
    }

    update(){

    }

    render(){
        this.ctx.save()
        this.ctx.beginPath()
        this.image.onload = ()=>{
            this.ctx.drawImage(this.image,this.x, this.y, 40, 40)
        }
        this.ctx.rect(this.x, this.y, 40, 40)
        if(this.fillStyle) {
            // console.log(`fillStyle is ${this.fillStyle}`)
            this.ctx.fillStyle = this.fillStyle
            this.ctx.fill()
        }
        if(this.strokeStyle) {
            this.ctx.strokeStyle = this.strokeStyle
            this.ctx.stroke()
        }
        this.setRange(this.x, this.x+40, this.y, this.y+40)
        // this.ctx.closePath()
        this.ctx.restore()
    }
}
