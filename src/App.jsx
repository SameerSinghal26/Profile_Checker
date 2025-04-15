import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast.jsx";
import "./App.css";
import { useUsername } from './Username.jsx';


function App() {
  const { username, setUsername } = useUsername();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast({ msg });
    setTimeout(() => setToast(null), 4000);
  };
  const enterkeypress = (event) => {
    if (event.key === "Enter") {
      if (!username) {
        showToast("Please enter a username!");
      } else {
        showToast("Please select the platform!");
      }
    }
  };

  useEffect(() => {
    const handleReload = () => {
      navigate("/");
    };
    window.addEventListener("beforeunload", handleReload);
    return () => window.removeEventListener("beforeunload", handleReload);
  }, [navigate]);

  const handleNavigation = (platform) => {
    if (!username) {
      return showToast("Please enter a username!");
    }
    setLoading(true);
    navigate(`/${platform}/${username}`);
  };

  return (
    <>
      {toast && <Toast message={toast.msg} />}
      <div className="mt-15 w-full flex justify-center lg:mt-10">
        <h1 className="text-3xl font-bold text-white">Profile Checker</h1>
      </div>
      <div className="flex justify-center items-center space-x-10 bg-gray-500 p-4 mt-4 lg:space-x-20">
        <img
          src="/assets/leetcode_icon.png"
          alt="LeetCode"
          className="w-13 h-13 object-cover rounded-lg lg:w-16 lg:h-16"
          onClick={() => handleNavigation("leetcode")}
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
          alt="Github"
          className="w-13 h-13 object-cover rounded-lg lg:w-16 lg:h-16"
          onClick={() => handleNavigation("github")}
        />
        <img
          src="/assets/codeforces_icon.png"
          alt="Codeforces"
          className="w-13 h-13 object-cover rounded-lg lg:w-16 lg:h-16"
          onClick={() => handleNavigation("codeforces")}
        />
        <img
          src="/assets/codechef_icon.png"
          alt="codechef"
          className="w-15 h-13 object-cover rounded-lg lg:w-18 lg:h-16"
          onClick={() => handleNavigation("codechef")}
        />
      </div>
      <div className="flex flex-col items-center gap-4 p-6">
        <input
          type="text"
          placeholder="Enter Username"
          defaultValue={""}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={enterkeypress}
          className="border p-2 rounded-md"
        />
      </div>
    </>
  );
}
export default App;
