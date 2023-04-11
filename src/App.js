import "./style/global.css";
import { createContext, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import BookCoverSwap from "./component/BooksCoverSwap.js";
import { VirtualBrailleDisplay } from "./component/VirtualBrailleDisplay";
import bg from "./asset/mountains.svg";
import { LoadingAnimation } from "./component/loadingComponent";

const NotVisible = VisibilityOffOutlinedIcon;
const Visible = VisibilityOutlinedIcon;
let tes = undefined;
export const Context = createContext(null);

function App() {
  const [dataFromRust, setDataFromRust] = useState(undefined);
  async function updateUI() {
    return await invoke("update_ui");
  }
  useEffect(() => {
    clearInterval();
    setInterval(() => {
      updateUI()
        .catch((err) => console.log("ERROR:", err.message))
        .then((newData) => {
          if (JSON.stringify(tes) !== JSON.stringify(JSON.parse(newData))) {
            tes = JSON.parse(newData);
            setDataFromRust(tes);
          }
        });
    }, 200);
  }, []);

  return (
    <main className="h-screen w-screen  bg-fixed bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(${bg})` }}>
      {dataFromRust === undefined ? (
        <>
          <WaitMode />
        </>
      ) : dataFromRust.mode === 0 ? (
        <>
          <LoginPage nik={dataFromRust.content_0.nik} error={dataFromRust.content_0.errorState} />
        </>
      ) : dataFromRust.mode === 1 ? (
        <>
          <SelectBook
            Title={dataFromRust.content_1.Title}
            Author={dataFromRust.content_1.Author}
            Availbillity={dataFromRust.content_1.avail}
            Edition={dataFromRust.content_1.Edition}
            Year={dataFromRust.content_1.Year}
            Language={dataFromRust.content_1.Langguage}
            coverUri_1={dataFromRust.content_1.BookCover}
          />
        </>
      ) : dataFromRust.mode === 2 ? (
        <>
          <ReadBook
            text={dataFromRust.content_2.pageContent}
            Title={dataFromRust.content_2.titleBook}
            lineNow={dataFromRust.content_2.line}
            maxLine={dataFromRust.content_2.maxLine}
            maxPage={dataFromRust.content_2.maxPage}
            pageNow={dataFromRust.content_2.page}
          />
        </>
      ) : dataFromRust.mode === 3 ? (
        <>
          <SearchBook err={dataFromRust.content_3.errorState} ListBookData={dataFromRust.content_3.ListBookData} indexBookList={dataFromRust.content_3.index} />
        </>
      ) : (
        <></>
      )}
    </main>
  );
}

export default App;

function LoginPage({ nik, err }) {
  const [data, setData] = useState("");
  function toRust(data, status) {
    invoke("data_from_ui_login", { data, status });
  }
  const [peek, setPeek] = useState(false);
  const [errorState, setErrorState] = useState(err);
  useEffect(() => {
    setErrorState(err);
    if (err === true)
      setTimeout(() => {
        setErrorState(false);
      }, 2500);
  }, [nik, err]);
  return (
    <>
      <div className="h-full w-full justify-center  flex ">
        <div className="w-[460px] h-40 bg-blue-100 bg-opacity-10 border-2 border-slate-800 border-opacity-50 rounded-xl relative flex flex-col justify-start items-center mt-32">
          <h1 className="absolute top-[-70px] text-center pl-1 w-full text-indigo-500 text-6xl">LOGIN</h1>
          <p className="font-semibold text-3xl text-center  mt-2 cursor-default text-indigo-500">NIK</p>
          <input
            type={`${peek ? "text" : "password"}`}
            className=" text-2xl text-center mt-1 border-b-2 border-black w-[90%] cursor-default bg-transparent focus:outline-none"
            autoFocus
            value={data}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log(data);
                toRust(data, true);
                setTimeout(() => {
                  setData("");
                  toRust("", false);
                }, 500);
              }
            }}
            onChange={(e) => setData(e.target.value)}
          />
          <p className="text-lg mt-0 border-black w-4/5 m-auto text-black cursor-default">
            {errorState ? (
              <>
                <span className="text-red-600">Error:</span> NIK tidak terdaftar cek kembali NIK yang diberikan
              </>
            ) : (
              <>
                <span className="text-indigo-500">Info:</span> Silahkan masukan nik anda, dan tekan tombol login pada braille display
              </>
            )}
          </p>
          <span className="absolute top-14 right-7" onClick={() => setPeek(!peek)}>
            {peek ? <Visible></Visible> : <NotVisible></NotVisible>}
          </span>
        </div>
      </div>
    </>
  );
}

let timeoutID = undefined;

function SearchBook({ err, ListBookData, indexBookList }) {
  const bookListResult = ListBookData;
  const [bookTitle, setBookTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookIndexAt, setBookIndexAt] = useState(indexBookList);
  const [errorState, setErrorState] = useState(err);
  const scrollBar = useRef(null);

  function toRust(data, status) {
    invoke("data_from_ui_search", { data, status });
  }
  useEffect(() => {
    if (ListBookData.length !== 0) {
      setIsLoading(false);
      setErrorState(false);
      clearTimeout(timeoutID);
    } else setErrorState(err);
    if (errorState === true) {
      clearTimeout(timeoutID);
      setIsLoading(false);
    }
  }, [err, ListBookData]);

  useEffect(() => {
    setIsLoading(false);
    setTimeout(() => {
      setErrorState(false);
      invoke("reset_error_state_from_ui_search");
      setBookTitle("");
    }, 2500);
  }, [errorState]);

  useEffect(() => {
    setBookIndexAt(indexBookList);
    const position = scrollBar.current.scrollTop;
    if (indexBookList < 4) scrollBar.current.scrollTo({ top: 0 });
    else if (indexBookList % 4 === 0) scrollBar.current.scrollTo({ top: position + 459 });
  }, [indexBookList]);

  return (
    <>
      <div className="h-full w-full  flex  flex-col items-center ">
        <div className="w-[460px] h-24 bg-blue-100 bg-opacity-10 border-2 border-slate-800 border-opacity-50 rounded-xl relative flex flex-col justify-start items-center mt-20">
          <h1 className="absolute top-[-50px] text-center pl-1 w-full text-indigo-800 text-4xl">Search Book</h1>
          <p className="font-semibold text-2xl text-center  mt-2 cursor-default text-indigo-500">Title</p>
          <input
            type="text"
            className=" text-2xl text-center mt-1 border-b-2 border-black w-[90%] cursor-default bg-transparent focus:outline-none"
            autoFocus
            value={bookTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log(bookTitle);
                toRust(bookTitle, true);
                setIsLoading(true);
                setTimeout(() => {
                  toRust(bookTitle, false);
                }, 500);
                timeoutID = setTimeout(() => {
                  if (ListBookData.length === 0) setErrorState(true);
                }, 7500);
              }
            }}
            onChange={(e) => {
              setBookTitle(e.target.value);
              setErrorState(false);
            }}
          />
        </div>
        <div className="w-[100%] h-[80%] flex items-center justify-around relative">
          <div
            className={`w-4/6 h-[75%] rounded-xl bg-black  border border-black flex flex-wrap  gap-2  p-4 overflow-y-auto ${isLoading ? "bg-opacity-80 items-center  justify-center" : "bg-opacity-30"}
            ${errorState ? "bg-opacity-100 items-center  justify-center" : ""}`}
            ref={scrollBar}
          >
            {isLoading ? (
              <h1 className="text-2xl font-bold text-white">
                Loading <LoadingAnimation className="h-7 w-7 fill-orange-400 ml-2 antialiased" />
              </h1>
            ) : errorState ? (
              <h1 className="text-white text-3xl">Book Not found!</h1>
            ) : (
              <>
                {bookListResult.map((book, index) => (
                  <div key={index} className={`w-[22%] h-3/4 border border-white bg-slate-500 ${bookIndexAt === index ? "  border-[3px] border-red-600" : ""}`}></div>
                ))}
              </>
            )}
          </div>
          <div className="w-[30%] h-[75%] border border-black flex flex-wrap items-center flex-col bg-black bg-opacity-60 rounded-md justify-around">
            {bookListResult.length === 0 ? (
              <>
                <h1 className="text-xl underline text-white font-serif font-bold ">TITLE</h1>
                <h1 className="text-3xl text-orange-400 w-full block   text-center">-</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">AUTHOR</h1>
                <h1 className="text-3xl text-orange-400 w-full block   text-center">-</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">EDITION</h1>
                <h1 className="text-3xl text-orange-400 w-full block   text-center">-</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">YEAR</h1>
                <h1 className="text-3xl text-orange-400 w-full block   text-center">-</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">LANGUAGE</h1>
                <h1 className="text-3xl text-orange-400 w-full block   text-center">-</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">AVAILABILITY</h1>
                <h1 className="text-3xl text-orange-400 w-full block   text-center">-</h1>
              </>
            ) : (
              <>
                <h1 className="text-xl underline text-white font-serif font-bold ">TITLE</h1>
                <h1 className="text-3xl text-orange-400 w-full block   text-center">{bookListResult[indexBookList].Title.toUpperCase()}</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">AUTHOR</h1>
                <h1 className="text-3xl text-orange-400">{bookListResult[indexBookList].Author.toUpperCase()}</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">EDITION</h1>
                <h1 className="text-3xl text-orange-400">{bookListResult[indexBookList].Edition.toUpperCase()}</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">YEAR</h1>
                <h1 className="text-3xl text-orange-400">{bookListResult[indexBookList].Year.toUpperCase()}</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">LANGUAGE</h1>
                <h1 className="text-3xl text-orange-400">{bookListResult[indexBookList].Language.toUpperCase()}</h1>
                <h1 className="text-xl underline text-white font-serif font-bold">AVAILABILITY</h1>
                <h1 className="text-3xl text-orange-400">{bookListResult[indexBookList].Availability.toUpperCase()}</h1>
              </>
            )}
          </div>
          <div className="w-4/6 h-[75%]  absolute left-4"></div>
        </div>
      </div>
    </>
  );
}

function ReadBook({ text, Title, maxPage, maxLine, pageNow, lineNow }) {
  const [buttonMsg, setButtonMsg] = useState("");
  return (
    <Context.Provider value={[buttonMsg, setButtonMsg]}>
      <div className="h-screen w-screen  flex flex-col justify-around items-center">
        <h1 className="font-bold text-5xl relative top-7">E-Braille.V2</h1>
        <div className="h-[25%] w-4/5  border-2 border-black relative top-4">
          <VirtualBrailleDisplay text={text} disabled={false} />
        </div>
        <div className="h-2/5 w-4/5  flex flex-col">
          <div className="w-full h-3/4 bg-slate-500 p-2 flex gap-2">
            <div className="w-1/4 h-full bg-slate-100 p-3">
              <h1 className=" text-center font-bold">Book Information</h1>
              <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
              <div className="my-2 h-[90%] flex flex-col gap-3">
                <div className="flex gap-2">
                  <h1 className="font-bold">Title: {Title}</h1>
                  <p>{}</p>
                </div>
                <div className="flex gap-2">
                  <h1 className="font-bold">Max Page: {maxPage}</h1>
                  <p>{}</p>
                </div>

                <div className="flex gap-2">
                  <h1 className="font-bold">Max Line: {maxLine}</h1>
                  <p>{}</p>
                </div>
                <div className="flex gap-2">
                  <h1 className="font-bold">Page Now: {pageNow}</h1>
                  <p>{}</p>
                </div>
                <div className="flex gap-2">
                  <h1 className="font-bold">Line Now: {lineNow}</h1>
                  <p>{}</p>
                </div>
              </div>
            </div>
            <div className="w-3/4 h-full bg-slate-800 p-3">
              <h1 className="text-white font-bold">Button Information:</h1>
              <p className="text-white pl-2">{buttonMsg}</p>
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
}

function SelectBook({ Title, Author, Availbillity, Edition, Year, Language, coverUri_1 }) {
  console.log("Title, Author, Availbillity, Edition, Year, Language, coverUri_1: ", Title, Author, Availbillity, Edition, Year, Language, coverUri_1);
  const [buttonMsg, setButtonMsg] = useState("");
  return (
    <Context.Provider value={[buttonMsg, setButtonMsg]}>
      <div className="w-full h-full pt-36">
        <div className="w-5/6 h-1/5 m-auto  border-2 border-black">
          <VirtualBrailleDisplay text={Title} disabled={true} />
        </div>
        <div className="w-3/6 h-[56%] m-auto bg-red-300 bg-opacity-60 relative border-2 border-white flex gap-4 justify-center mt-5 items-center rounded-lg border-opacity-25">
          <BookCoverSwap coverUri={coverUri_1} className="" />
          <div className="w-2/6 h-4/6 border-2 border-black flex flex-col gap-1 justify-around pl-2 rounded-lg bg-white bg-opacity-70 border-opacity-30">
            <p>Title: {Title}</p>
            <p>Author: {Author}</p>
            <p>Availbillity: {Availbillity}</p>
            <p>Edition: {Edition}</p>
            <p>Year: {Year}</p>
            <p>Language: {Language}</p>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
}

function WaitMode() {
  return (
    <>
      <div className="h-screen w-screen  bg-[#167492] flex justify-center items-center">
        <h1 className=" font-bold text-3xl">{"WAIT!--> Conecting to e-braille display"}</h1>
      </div>
    </>
  );
}
