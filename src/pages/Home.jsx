import Header from "../components/Header";
import BusInput from "../components/BusInput";
import ETAResult from "../components/ETAResult";
import Alerts from "../components/Alerts";
import Chatbot from "../components/Chatbot";

function Home() {
  return (
    <div>
      <Header />
      <BusInput />
      <ETAResult />
      <Alerts />
      <Chatbot />
    </div>
  );
}

export default Home;
