export default class RangeObject{
    rangeStartX: number
    rangeEndX: number
    rangeStartY: number
    rangeEndY: number
    innerRangeObjects: Array<any>

    constructor(){
        this.innerRangeObjects = []
    }
    setRange(rangeStartX: number, rangeEndX: number, rangeStartY: number, rangeEndY: number){
        this.rangeStartX = rangeStartX
        this.rangeEndX = rangeEndX
        this.rangeStartY = rangeStartY
        this.rangeEndY = rangeEndY
    }
    checkRange(targetX, targetY, type?){
        // console.log(`checking... targetX: ${targetX}, targetY: ${targetY}`)
        // console.log(this.innerRangeObjects.map(item=>item))
        // for(let i=0;i<this.innerRangeObjects.length;i++) {
        //     let obj = this.innerRangeObjects[i]
        //     // console.log((targetX>=obj.rangeStartX&&targetX<=obj.rangeEndX)&&
        //     //     (targetY>=obj.rangeStartY&&targetY<=obj.rangeEndY))
        //     if((targetX>=obj.rangeStartX&&targetX<=obj.rangeEndX)&&
        //         (targetY>=obj.rangeStartY&&targetY<=obj.rangeEndY)){
        //         console.log('clicked target obj is')
        //         console.log(obj)
        //         break
        //     }
        // }
    }
}
