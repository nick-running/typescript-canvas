import TimelinePacket from './TimelinePacket'


export default class TimelineLauncher{
    TimelinePacket: TimelinePacket
    constructor(canvas, x, width, height, strokeStyle?, startPointY?){
        this.TimelinePacket = new TimelinePacket(canvas, x, width, height, strokeStyle, startPointY)
    }
    start(){

    }
}