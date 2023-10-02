import { useEffect, useState } from "react";
import "./App.css";
import { Currency } from "./models/CurrencyModel";
import FormInput from "./components/FormInput/";
import { API_URL } from "./constants";
import { CircularProgress } from "@mui/material";

function App() {
  const [currencyList, setCurrencyList] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let subcribed = true;
    try {
      setLoading(true);
      fetch(API_URL).then((res: Response) => {
        res.json().then((json: Currency[]) => {
          if (subcribed) {
            setLoading(false);
            setCurrencyList(json);
          }
        });
      });
    } catch (error) {
      if (subcribed) {
        alert("There is an error fetching the currency! Please try again.");
        setLoading(false);
        setCurrencyList([]);
      }
    }
    return () => {
      subcribed = false;
    };
  }, []);

  if (loading) {
    return (
      <div id="loading">
        <CircularProgress />
      </div>
    );
  }
  return <FormInput currencyList={currencyList} />;
}

export default App;
