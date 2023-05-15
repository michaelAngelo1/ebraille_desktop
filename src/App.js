import "./style/global.css";
import { createContext, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import BookCoverSwap from "./component/BooksCoverSwap.js";
import { VirtualBrailleDisplay } from "./component/VirtualBrailleDisplay";
import bg from "./asset/mountains.svg";
import binusBg from "./asset/logoBinus.png";
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
    <main className="h-screen w-screen  bg-fixed bg-center bg-cover bg-no-repeat relative" style={{ backgroundImage: `url(${bg})` }}>
      {dataFromRust !== undefined && <img src={binusBg} alt="" className="absolute w-[10%] h-[10%] mt-3 ml-3 z-[999]" />}

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
  const [errorState, setErrorState] = useState(true);
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
    if (errorState)
      setTimeout(() => {
        setErrorState(false);
        invoke("reset_error_state_from_ui_search");
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
      <div className="h-full w-full p-10 gap-5 flex flex-col ">
        <div className="w-full h-80  relative flex  justify-start items-center gap-3">
          <div className="w-4/6 h-full  bg-black/70 border-2 border-slate-800 border-opacity-50 rounded-xl relative flex flex-col justify-center items-center">
            <div className=" w-[80%] h-auto bg-slate-50/20 flex flex-col justify-center items-center rounded-lg p-2 border-2 border-orange-500">
              <h1 className="absolute top-[40px] text-center pl-1 w-full text-indigo-300 text-4xl">Search Book</h1>
              <p className="font-semibold text-2xl text-center  mt-2 cursor-default text-indigo-300">Title</p>
              <input
                type="text"
                className=" text-2xl text-center mt-1 border-b-2 border-black w-[90%] cursor-default bg-transparent focus:outline-none text-white"
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
          </div>
          <div className="grow h-full bg-blue-800 bg-opacity-10 border-2 border-slate-800 border-opacity-50 rounded-xl relative p-9 pt-12 text-">
            <h1 className="font-bold text-xl">Button Information:</h1>
            <p>
              <span className="font-bold">Tombol 1 :</span> Halaman Utama
            </p>
            <p>
              <span className="font-bold">Tombol 6 :</span> Menampilkan Judul Buku
            </p>
            <p>
              <span className="font-bold">Tombol 7 :</span> Menampilkan Ketikkan Pengguna
            </p>
            <p>
              <span className="font-bold">Tombol 24 :</span> Baca Buku
            </p>
            <p>
              <span className="font-bold">Tombol Atas :</span> Buku Sebelumnya
            </p>
            <p>
              <span className="font-bold">Tombol Bawah :</span> Buku Selanjutnya
            </p>
            <p>
              <span className="font-bold">Tombol Kiri :</span> Tab Kiri
            </p>
            <p>
              <span className="font-bold">Tombol Kanan :</span> Tab Kanan
            </p>
          </div>
        </div>

        <div className="w-full grow flex relative  gap-3">
          <div
            className={`w-4/6 h-full rounded-xl bg-black  border border-black flex flex-wrap  gap-2  p-4 overflow-y-auto ${isLoading ? "bg-opacity-80 items-center  justify-center" : "bg-opacity-30"}
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
                  <div key={index} className={`relative w-[22%] h-3/4 border-[3px] bg-slate-500 ${bookIndexAt === index ? " border-red-600" : "border-white"}`}>
                    <img src={book.BookCoverUri} alt="" className="absolute bg-contain w-full h-full" />
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="grow h-full border border-black flex flex-wrap items-center flex-col bg-black bg-opacity-60 rounded-md justify-around">
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
                </div>
                <div className="flex gap-2">
                  <h1 className="font-bold">Max Page: {maxPage}</h1>
                </div>
                <div className="flex gap-2">
                  <h1 className="font-bold">Max Line: {maxLine}</h1>
                </div>
                <div className="flex gap-2">
                  <h1 className="font-bold">Page Now: {pageNow}</h1>
                </div>
                <div className="flex gap-2">
                  <h1 className="font-bold">Line Now: {lineNow}</h1>
                </div>
              </div>
            </div>
            <div className="w-3/4 h-full bg-white p-3">
              <h1 className="text-black font-bold">Button Information:</h1>
              <p>Tombol 1 : Halaman Utama </p>
              <p>Tombol 3 : Tandai Baris </p>
              <p>Tombol 4 : Buka baris yang ditandai </p>
              <p>Tombol Atas : Baris sebelumnya</p>
              <p> Tombol Bawah : Baris selanjutnya</p>
              <p> Tombol Kiri : Tab Kiri </p>
              <p>Tombol Kanan : Tab Kanan</p>
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
      <div className="w-full h-full pt-44 bg-slate-50/20 flex flex-col justify-start items-center">
        <div className="w-5/6 h-1/5 border-2 border-black mb-3 relative flex justify-center">
          <VirtualBrailleDisplay text={Title} disabled={true} />
          <h1 className="absolute -top-[85px]  text-5xl font-bold ">E-braille V2</h1>
        </div>
        <div className=" w-5/6 h-[70%] bg-slate-400/0 flex p-2 gap-2">
          <div className="w-2/3 h-full  bg-red-300/90 relative border-2 border-white flex gap-4 justify-center  items-center rounded-lg border-opacity-25">
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
          <div className="w-1/3 h-full  bg-white/80 relative border-2 border-white flex gap-4 justify-center  items-center rounded-lg border-opacity-25">
            <div className=" border-2 border-emerald-400 rounded-md p-3">
              <h1 className="text-black font-bold text-xl">Button Information:</h1>
              <p className="">
                <span className="font-bold">Tombol 1:</span> Halaman Utama
              </p>
              <p className="">
                <span className="font-bold">Tombol 2:</span> Cari Buku
              </p>
              <p className="">
                <span className="font-bold">Tombol 5:</span> Daftar Bookmark Buku
              </p>
              <p className="">
                <span className="font-bold">Tombol 22:</span> Logout
              </p>
              <p className="">
                <span className="font-bold">Tombol 24:</span> Baca Buku
              </p>
              <p className="">
                <span className="font-bold">Tombol Atas:</span> Buku Sebelumnya
              </p>
              <p className="">
                <span className="font-bold">Tombol Bawah:</span> Buku Selanjutnya
              </p>
              <p className="">
                <span className="font-bold">Tombol Kiri:</span> Tab Kiri
              </p>
              <p className="">
                <span className="font-bold">Tombol Kanan:</span> Tab Kanan
              </p>
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
}

function WaitMode() {
  return (
    <>
      {/* <div className="h-screen w-screen  bg-[#167492] flex justify-center items-center"> */}
      <div className="h-screen w-screen  bg-white flex justify-center items-center relative">
        <img src={binusBg} alt="" className="bg-contain w-[50%] h-[50%]" />
        <h1 className=" font-bold text-3xl absolute bottom-28">{"WAIT!--> Conecting to e-braille display "}</h1>
      </div>
    </>
  );
}
