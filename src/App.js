import HomePage from "./page/homePage/index";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./components/welcome";
import LandingPage from "./page/landingPage/index";
import ErrorMessage from "./components/errorMessage";
import theme from "./assets/theme";
import { ThemeProvider } from "@mui/material";
import Footer from "./components/footer";
import Dashboard from "./components/Dashboard/Dashboard";

import RideGoogleMap from "./page/homePage/components/googleMap";
import Header from "./components/Appbar";
import Cars from "./page/UserManagement/DataTable/Car/Car";
import EtraOptions from "./page/UserManagement/DataTable/ExtraOption/EtraOption";
import PointToPointBooks from "./page/UserManagement/DataTable/PointToPointBook/PointToPointBook";
import Users from "./page/UserManagement/DataTable/User/User";
import { QueryClient, QueryClientProvider } from "react-query";

function App() {
  const queryClient = new QueryClient();

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Header />
          <Routes>
            {/* <Route path="/" element={<LandingPage />}></Route>
          <Route path="/home/:id" element={<HomePage />}></Route>
          <Route path="/map" element={<RideGoogleMap />}></Route>
          <Route path={"*"} element={<ErrorMessage />}></Route> */}

            <Route path="/" element={<Users />} />

            <Route path="/dashboard" name="dashboard" element={<Dashboard />}>
              <Route index element={<Cars />}></Route>
              <Route path={"cars"} element={<Cars />}></Route>
              <Route path={"etraOptions"} element={<EtraOptions />}/>
              <Route path={"pointToPointBookss"} element={<PointToPointBooks />} ></Route>
              <Route path={"users"} element={<Users/>}></Route>
            </Route>
          </Routes>
          <Footer />
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
