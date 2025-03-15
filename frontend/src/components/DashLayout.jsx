import { Outlet } from "react-router-dom"
import Header from "./Header.jsx"


const DashLayout = () => {
    return (
        <>
            <Header />
            <div className="dash-container">
                <Outlet />
            </div>
        </>
    )
}
export default DashLayout