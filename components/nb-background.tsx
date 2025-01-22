import "./animation.css";
import {Avatar} from "@nextui-org/react"
type NbBackgroundProps = {
  width: number; 
};

export default function NbBackground({width}:NbBackgroundProps) {
  return (
    <div style={{ width: width*0.99 ,
      position: "absolute",
      top: "15%", 
      left: "50%",
      transform: "translate(-50%, -50%)",
      marginLeft: "0%",}}>
      <div className="Wrapper flex items-start justify-evenly relative flex-wrap">
        <div className="CrossA absolute top-[10%] left-0 transform skew-y-3 w-full overflow-hidden h-12 z-101" style={{backgroundColor:"pink"}}>
          <div className="Items flex items-center absolute top-0 left-0 z-1 h-full">
            <div className="Item flex items-center animation1">
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
                .map((_, i) => (
                  <>
                    <div className="flex items-center gap-2 rounded-xl p-2 cursor-pointer hover:bg-white">
                                <Avatar
                                  className="w-6 h-6"
                                  src="/icon/sol.png"
                                />
                              <span className="text-lg " style={{color:"black"}}>SOL</span>
                            </div>
                          <span>※</span>
                  </>
                ))}
            </div>
          </div>
        </div>
        <div className="CrossB absolute top-[10%] left-0 transform skew-y-[-6deg] w-full overflow-hidden h-12 z-100 font-bold text-xl" style={{backgroundColor:"green"}}>
          <div className="Items flex items-center absolute top-0 left-0 z-1 h-full">
            <div className="Item flex items-center animation1">
              {
              [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
                .map((_, i) => (
                  <>
                    <div className="flex items-center gap-2 rounded-xl p-2 cursor-pointer hover:bg-black">
                                <Avatar
                                  className="w-6 h-6"
                                  src="/icon/sol.png"
                                />
                              <span className="text-lg " style={{color:"white"}}>SOL</span>
                            </div>
                          <span>※</span>
                  </>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
