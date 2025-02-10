import { Avatar, MenuItem } from "@nextui-org/react";

import { getPumpLtsTokenList } from "@/core/tokens";

import { useState, useEffect } from "react";
import { eventBus } from "@/core/events";
import { pumpLtsMock } from "@/core/mock";
type NbBackgroundProps = {
  width: number;
};

export default function NbBackground({ width }: NbBackgroundProps) {
  const [ltsToken, setLtsToken] = useState([]);

  useEffect(() => {
    const onload = async () => {
      let lts = [];
      if (ltsToken && ltsToken.length > 0) {
        // console.log("req exsit")
      } else {
        // console.log("new req")
        lts = await getPumpLtsTokenList(42);
        if (!lts || lts.length == 0) {
          lts = pumpLtsMock;
        }
        setLtsToken(lts);
      }

      // console.log("💊Lts :: ",lts)
    };
    onload();
  });

  const updateToken = (data: any) => {
    // console.log(
    //   "updateToken",data
    // )
    eventBus.emit("update_selected_token", data);
  };
  return (
    <div
      style={{
        width: width * 0.99,
        position: "absolute",
        top: "15%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        marginLeft: "0%",
      }}
    >
      <div className="Wrapper flex items-start justify-evenly relative flex-wrap">
        <div
          className="CrossA absolute top-[10%] left-0 transform skew-y-3 w-full overflow-hidden h-12 z-101"
          style={{ backgroundColor: "pink" }}
        >
          <div className="Items flex items-center absolute top-0 left-0 z-1 h-full">
            <div className="Item flex items-center animation1">
              {(ltsToken.slice(0,30)).map((item, i) => (
                <>
                  <div
                    className="flex items-center gap-2 rounded-xl p-2 cursor-pointer hover:bg-white"
                    onClick={() => {
                      updateToken(item);
                    }}
                  >
                    <Avatar
                      className="w-6 h-6"
                      src={JSON.parse(JSON.stringify(item)).image_uri}
                    />
                    <span className="text-lg " style={{ color: "black" }}>
                      {JSON.parse(JSON.stringify(item)).symbol}
                    </span>
                  </div>
                  <span>※</span>
                </>
              ))}
            </div>
          </div>
        </div>
        <div
          className="CrossB absolute top-[10%] left-0 transform skew-y-[-6deg] w-full overflow-hidden h-12 z-100 font-bold text-xl"
          style={{ backgroundColor: "green" }}
        >
          <div className="Items flex items-center absolute top-0 left-0 z-1 h-full">
            <div className="Item flex items-center animation1">
              {(ltsToken.slice(10,42)).map((item, i) => (
                <>
                  <div
                    className="flex items-center gap-2 rounded-xl p-2 cursor-pointer hover:bg-black"
                    onClick={() => {
                      updateToken(item);
                    }}
                  >
                    <Avatar
                      className="w-6 h-6"
                      src={JSON.parse(JSON.stringify(item)).image_uri}
                    />
                    <span className="text-lg " style={{ color: "white" }}>
                      {JSON.parse(JSON.stringify(item)).symbol}
                    </span>
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
