import { Rect } from "react-konva";
export default function SafeMarginGuides({margin=0,width,height,visible=false}){if(!visible||margin<=0)return null;return <Rect x={margin} y={margin} width={Math.max(1,width-margin*2)} height={Math.max(1,height-margin*2)} stroke="#f59e0b" strokeWidth={2} dash={[16,10]} listening={false}/>;}
