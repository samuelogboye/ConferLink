import { Login } from "../components/authentication/login";
// import { Join } from "../components/Join";

export const Home = () => {
    return (
        <div className="App flex items-center justify-center w-screen h-screen">
            <Login />
            {/* <Join /> */}
        </div>
    );
};
