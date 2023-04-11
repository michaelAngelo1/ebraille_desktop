import { useContext } from "react";
import { Context } from "../App";
let br = require("braille");

export function VirtualBrailleDisplay({ text, disabled = false }) {
  const Braille = br.toBraille(text);
  // const { setButtonMsg } = useContext(Context);
  const [, setButtonMsg] = useContext(Context);
  const ButtonMsg = (buttonIndex) => {
    setButtonMsg(ButtonMsgSelector(buttonIndex));
  };
  return (
    <div className="w-full h-full bg-red-300 flex flex-col">
      <div className="w-full h-1/5 bg-slate-500 ">
        <div onMouseLeave={() => setButtonMsg("")} className="w-full h-full bg-red-500 flex border-b-2 border-black">
          {[...Array(24)].map((v, i) => (
            <div
              key={i}
              className={
                i !== 23
                  ? "h-[100%] w-[5%] bg-slate-500 flex justify-center items-center hover:bg-slate-600 border-black border-r-2 select-none cursor-pointer"
                  : "h-[100%] w-[5%] bg-slate-500 flex justify-center items-center hover:bg-slate-600 border-black select-none"
              }
              onClick={() => (!disabled ? ButtonMsg(i + 1) : setButtonMsg(""))}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[55%] bg-white flex border-b-2  border-black  ">
        {[...Array(24)].map((v, i) => (
          <div
            key={i}
            className={
              i !== 23
                ? "h-[100%] w-[5%]  flex justify-center items-center  border-black border-r-2 select-none cursor-default"
                : "h-[100%] w-[5%]  flex justify-center items-center  border-black select-none"
            }
          >
            <p className="text-4xl 2xl:text-7xl">{Braille.at(i) !== undefined ? Braille.at(i) : ""}</p>
          </div>
        ))}
      </div>

      <div className="w-full flex-grow bg-red-500 flex ">
        {[...Array(24)].map((v, i) => (
          <div
            key={i}
            className={
              i !== 23
                ? "h-[100%] w-[5%]  flex justify-center items-center  border-black border-r-2 select-none cursor-default"
                : "h-[100%] w-[5%]  flex justify-center items-center  border-black select-none"
            }
          >
            <p className="text-white font-semibold text-2xl">{text.at(i) !== undefined ? text.at(i) : ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ButtonMsgSelector(value) {
  let msg = "";
  switch (parseInt(value)) {
    case 1:
      msg = "Button 1";
      break;
    case 2:
      msg = "Button 2";
      break;
    case 3:
      msg = "Button 3";
      break;
    default:
      msg = "";
      break;
  }
  return msg;
}
