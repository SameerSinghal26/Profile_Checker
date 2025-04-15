import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import upIcon from "/assets/up_icon.png";
import downIcon from "/assets/down_icon.png";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useUsername } from '../../Username.jsx';

function Codechef() {
  const { username, setUsername } = useUsername();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredData, setHoveredData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  const baseUrl = "https://codechef-api.vercel.app/handle";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch(`${baseUrl}/${username}`);
        const profileData = await profileRes.json();

        setProfile(profileData);
      } catch (err) {
        console.error("Error loading Codechef data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
    const generategraph = () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      const dateArray = [];
      const currentDate = new Date(startDate);
  
      while (currentDate <= endDate) {
        dateArray.push({
          date: currentDate.toISOString().split("T")[0],
          count: Math.floor(Math.random() * 10),
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dateArray;
    };
  
    setHeatmapData(generategraph());
  }, [username]);

  const handleClick = () => {
    setUsername('');
    navigate("/");
  };

  if (loading) {
    return <p className="text-white text-center text-xl mt-5">Loading...</p>;
  }

  if (!profile) {
    return <p className="text-red-500 text-xl text-center">User data not available.</p>;
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}`;
  };

  const chartData = profile.ratingData
    .filter((item) => item.end_date)
    .map((item, index, arr) => {
      const currentRating = Number(item.rating);
      const previousRating =
        index > 0 ? Number(arr[index - 1].rating) : currentRating;
      const direction =
        currentRating >= previousRating
          ? "UP"
          : currentRating < previousRating
          ? "DOWN"
          : "SAME";
      return {
        name: formatDate(item.end_date),
        rating: currentRating,
        ranking: Number(item.rank),
        title: item.name,
        timestamp: new Date(item.end_date).getTime() / 1000,
        direction: direction,
      };
    });

  const lastPointIndex = chartData.length - 1;
  const firstYear = +formatDate(chartData[0].timestamp);
  const lastYear = +formatDate(chartData[lastPointIndex].timestamp);

  const currentData = hoveredData ?? chartData[lastPointIndex];

  const created_at = new Date(profile.heatMap[0].date);
  const option = { year: "numeric", month: "long" };
  const formattedDate = created_at.toLocaleDateString("en-US", option);

  return (
    <div className="bg-gray-900 text-white p-6 text-center min-h-screen">
      {/* Profile Info */}
      <div className="mb-8">
        <div className="flex items-center gap-5 justify-center py-5">
          <img
            className="h-30 w-30 lg:w-40 lg:h-40 rounded-full"
            src={profile.profile || "No User found"}
            alt=""
          />
          <div className="font-medium dark:text-white text-xl">
            <div>{profile.name || "No Name Available"}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Joined in {formattedDate || "Not Available"}
            </div>
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-300 my-2">
          Username : {username}
        </h1>
        <p className="text-center text-gray-400 mt-2 text-l">
          Global Rank : <span className="font-bold">{profile.globalRank}</span>{" "}
          | Country Rank :{" "}
          <span className="font-bold">{profile.countryRank}</span>
        </p>
        <p className="text-center text-gray-400 mt-2 text-xl">
          {`👨‍💻 ${profile.stars} Coder from ${profile.countryName} || Passionate about problem-solving and improving competitive programming skills.` ||
            "No Bio Available"}
        </p>
      </div>

      {/* Chart Section */}
      <div className="mb-6 flex justify-center">
        <div className="w-full max-w-3xl h-[345px] lg:h-[430px] bg-[#1e1e1e] text-white p-4 rounded-xl">
          <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-white text-sm sm:text-base">
            <div>
              <p className="text-gray-400">Contest Rating</p>
              <p className="text-xl lg:text-2xl font-bold flex items-center gap-1">
                {Math.round(currentData.rating)}
                <span className="text-xl">
                  {currentData.direction === "UP" ? (
                    <img className="w-5 h-5 inline" src={upIcon} alt="Up" />
                  ) : currentData.direction === "DOWN" ? (
                    <img className="w-5 h-5 inline" src={downIcon} alt="Down" />
                  ) : null}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-start">
                {new Date(currentData.timestamp * 1000).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </p>
              <p className="font-semibold">{currentData.title}</p>
            </div>
            <div>
              <p className="text-gray-400">Rank</p>
              <p className="font-semibold">
                {currentData.ranking?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Attended</p>
              <p className="font-semibold">{profile.ratingData.length}</p>
            </div>
          </div>
          <div className="w-full h-[220px] lg:h-[400px]">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -38, bottom: 45 }}
              onMouseMove={(e) => {
                if (e && e.activePayload) {
                  setHoveredData(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredData(null)}
            >
              <CartesianGrid stroke="" />
              <XAxis
                dataKey="timestamp"
                stroke=""
                tickFormatter={(value, index) => {
                  if (index === 0) return firstYear;
                  return lastYear;
                }}
                ticks={[
                  chartData[0]?.timestamp,
                  chartData[lastPointIndex]?.timestamp,
                ]}
                domain={["dataMin", "dataMax"]}
                type="number"
              />
              <YAxis
                stroke="#aaa"
                domain={[1500, "auto"]}
                tick={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#333", border: "none" }}
                labelFormatter={() => ""}
                formatter={(value) => [`Rating : ${Math.round(value)}`]}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#f9a825"
                strokeWidth={2}
                dot={({ cx, cy, index }) =>
                  index === lastPointIndex ? (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="white"
                      stroke="#f9a825"
                      strokeWidth={2}
                    />
                  ) : null
                }
                activeDot={{
                  r: 6,
                  stroke: "white",
                  strokeWidth: 2,
                  fill: "#f9a825",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Calender heatmap of codeforces */}
            <div className="flex justify-center lg:mt-8">
              <div className="bg-[#253745] pr-3 pl-1 py-1.5 lg:py-2 rounded-xl max-w-4xl w-200">
                <p className="lg:text-xl font-semibold text-black mb-3">Submissions</p>
                <CalendarHeatmap
                  startDate={
                    new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                  }
                  endDate={new Date()}
                  values={heatmapData}
                  classForValue={(value) => {
                    if (!value || value.count === 0) {
                      return "color-empty";
                    }
                    if (value.count > 6) return "color-scale-4";
                    if (value.count > 3) return "color-scale-3";
                    if (value.count > 2) return "color-scale-2";
                    return "color-scale-1";
                  }}
                  tooltipDataAttrs={(value) => {
                    return {
                      "data-tip": `${value.date} has ${value.count} submissions`,
                    };
                  }}
                  showWeekdayLabels
                />
              </div>
            </div>

      {/* Back button */}
      <button
        onClick={handleClick}
        className="bg-red-500 text-white font-bold py-2 px-4 mt-4 rounded"
      >
        Go to Home
      </button>
    </div>
  );
}

export default Codechef;
