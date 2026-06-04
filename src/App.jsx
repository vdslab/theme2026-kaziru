import { useEffect, useState } from "react";
import { loadCsv } from "./utils/loadCsv";

import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

export default function App() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function init() {
      try {
        const data = await loadCsv("/03_tag_diff_list.csv");

        console.log("rows:", data.length);
        console.log(data.slice(0, 5));

        setRows(data);
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
