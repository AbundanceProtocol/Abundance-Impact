import React, { useRef, useContext } from "react";
import Link from "next/link";
import { button } from "../../assets/button";
import BottomNav from "./BottomNav";
import useMatchBreakpoints from "../../../hooks/useMatchBreakpoints";
import { useAppRouter } from "../../../hooks/useAppRouter";
import { AccountContext } from "../../../context";
import {
  BsShieldCheck,
  BsShieldFillCheck,
  BsPiggyBank,
  BsPiggyBankFill,
  BsPerson,
  BsPersonFill,
  BsInfoCircle,
  BsInfoCircleFill,
  BsQuestionCircleFill,
  BsGear,
  BsGearFill,
  BsStar,
  BsStarFill,
  BsHouseDoor,
  BsHouseDoorFill,
  BsCurrencyExchange
} from "react-icons/bs";

const version = process.env.NEXT_PUBLIC_VERSION;

const BottomBar = () => {
  const ref1 = useRef(null);
  const { isMobile } = useMatchBreakpoints();
  const router = useAppRouter();
  const { isLogged, setPanelTarget, setPanelOpen, adminTest } = useContext(AccountContext);

  const openSwipeable = target => {
    setPanelTarget(target);
    setPanelOpen(true);
  };

  // Safety check for router.route
  if (!router.route) {
    return null;
  }

  return isMobile && !(version == "1.0" && !adminTest && !isLogged && router.route == "/") ? (
    <>
      {router.route !== "/~/studio/multi-tip-compose" && (
        <div
          ref={ref1}
          className="flex-row"
          style={{
            position: "fixed",
            bottom: 0,
            backgroundColor: "",
            height: "64px",
            width: `100%`,
            borderRadius: "0px",
            padding: "0 16px",
            border: "0px solid #678",
            boxSizing: "border-box"
          }}
        >
          {/* backgroundColor: '#002244cc' */}

          <div
            className="flex-row"
            style={{
              position: "relative",
              width: "100%",
              justifyContent: "center",
              padding: "0 0px",
              alignItems: "center",
              gap: "1rem"
            }}
          >
            <Link href={"/"}>
              <div
                className="flex-col"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: "54px",
                  width: "56px",
                  padding: "5px 10px",
                  borderRadius: "10px",
                  border: "1px solid #567",
                  backgroundColor: router.route == "/" ? "#224466aa" : "#002244aa",
                  backdropFilter: "blur(12px)"
                }}
              >
                <div className="flex-col" style={{ justifyContent: "center", alignItems: "center", height: "40px" }}>
                  {router.route == "/" ? (
                    <BsHouseDoorFill size={20} color={"#99ddff"} />
                  ) : (
                    <BsHouseDoor size={20} color={"#99ddff"} />
                  )}
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "400",
                      padding: "0 0 0 0",
                      color: "#99ddff",
                      margin: "4px 0 0 0"
                    }}
                  >
                    Home
                  </div>
                </div>
              </div>
            </Link>

            {(version == "2.0" || adminTest) && (
              <Link href={"/"}>
                <div
                  className="flex-col"
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: "54px",
                    width: "56px",
                    padding: "5px 10px",
                    borderRadius: "10px",
                    border: "1px solid #567",
                    backgroundColor: "#002244aa",
                    backdropFilter: "blur(12px)"
                  }}
                >
                  <div className="flex-col" style={{ justifyContent: "center", alignItems: "center", height: "40px" }}>
                    <BsShieldCheck size={20} color={"#99ddff"} />
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "400",
                        padding: "0 0 0 0",
                        color: "#99ddff",
                        margin: "4px 0 0 0"
                      }}
                    >
                      Validate
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <Link href={"/~/tip"}>
              <div
                className="flex-col"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: "54px",
                  width: "56px",
                  padding: "5px 10px",
                  borderRadius: "10px",
                  border: "1px solid #567",
                  backgroundColor: router.route == "/~/tip" ? "#224466aa" : "#002244aa",
                  backdropFilter: "blur(12px)"
                }}
              >
                <div className="flex-col" style={{ justifyContent: "center", alignItems: "center", height: "40px" }}>
                  <BsCurrencyExchange size={20} color={"#99ddff"} />
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "400",
                      padding: "0 0 0 0",
                      color: "#99ddff",
                      margin: "4px 0 0 0"
                    }}
                  >
                    Tip
                  </div>
                </div>
              </div>
            </Link>

            <Link href={"/~/ecosystems/abundance"}>
              <div
                className="flex-col"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: "54px",
                  width: "56px",
                  padding: "5px 10px",
                  borderRadius: "10px",
                  border: "1px solid #567",
                  backgroundColor: router.route == "/~/ecosystems/[ecosystem]" ? "#224466aa" : "#002244aa",
                  backdropFilter: "blur(12px)"
                }}
              >
                <div className="flex-col" style={{ justifyContent: "center", alignItems: "center", height: "40px" }}>
                  {router.route == "/~/ecosystems/[ecosystem]" ? (
                    <BsStarFill size={20} color={"#99ddff"} />
                  ) : (
                    <BsStar size={20} color={"#99ddff"} />
                  )}
                  {/* {(router.route !== '/~/ecosystems/abundance') ? (<BsStar size={20} color={'#99ddff'} />) : (<BsStarFill size={20} color={'#99ddff'} />)} */}
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "400",
                      padding: "0 0 0 0",
                      color: "#99ddff",
                      margin: "4px 0 0 0"
                    }}
                  >
                    Explore
                  </div>
                </div>
              </div>
            </Link>

            {(version == "2.0" || adminTest) && (
              <div
                className="flex-col"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: "54px",
                  width: "56px",
                  padding: "5px 10px",
                  borderRadius: "10px",
                  border: "1px solid #567",
                  backgroundColor: "#002244aa",
                  backdropFilter: "blur(12px)"
                }}
                onClick={() => openSwipeable("welcome")}
              >
                <div className="flex-col" style={{ justifyContent: "center", alignItems: "center", height: "40px" }}>
                  <BsInfoCircle size={20} color={"#99ddff"} />
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "400",
                      padding: "0 0 0 0",
                      color: "#99ddff",
                      margin: "4px 0 0 0"
                    }}
                  >
                    About
                  </div>
                </div>
              </div>
            )}

            {/* <div className='flex-col' style={{justifyContent: 'center', alignItems: 'center', height: '64px', width: '50px'}}>
              <div className='flex-col' style={{justifyContent: 'center', alignItems: 'center', height: '40px'}}>
                <BsQuestionCircle size={20} color={'#99ddff'} />
                <div style={{fontSize: '12px', fontWeight: '400', padding: '0 0 0 0', color: '#99ddff', margin: '4px 0 0 0'}}>About</div>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </>
  ) : (
    <>
      {isLogged && router.route !== "/~/studio/multi-tip-compose" && (
        <div
          ref={ref1}
          className="flex-row shadow"
          style={{
            position: "fixed",
            top: 0,
            backgroundColor: "#002244ee",
            height: "54px",
            width: `100%`,
            borderRadius: "0px",
            padding: "0",
            border: "0px solid #678",
            boxSizing: "border-box",
            justifyContent: "center"
          }}
        >
          <div
            className="flex-row"
            style={{
              position: "relative",
              maxWidth: "620px",
              width: "100%",
              justifyContent: "center",
              padding: "0 10px"
            }}
          >
            {button["bottom-nav"].map((btn, index) => (
              <BottomNav buttonName={btn} key={index} />
            ))}
          </div>
        </div>
      )}
    </>

    // <div ref={ref1} className='flex-row' style={{position: 'fixed', bottom: 0, backgroundColor: '#000000ff', height: '0px', width: `100%`, borderRadius: '0px', padding: '0', border: '0px solid #678', boxSizing: 'border-box'}}></div>
  );
};

export default BottomBar;
