import React, { useContext,useEffect, useState } from "react";
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
import { UsernameContext } from '../../Username.jsx';

function Codeforces() {
  const { username } = useParams();
  const { setUsername } = useContext(UsernameContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [ratingHistory, setRatingHistory] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredData, setHoveredData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  const baseUrl = "https://codeforces.com/api";
  useEffect(() => {
    const fetchCodeforcesData = async () => {
      try {
        const [profileRes, contestRes, submissionRes] = await Promise.all([
          fetch(`${baseUrl}/user.info?handles=${username}`),
          fetch(`${baseUrl}/user.rating?handle=${username}`),
          fetch(`${baseUrl}/user.status?handle=${username}`),
        ]);

        const profileData = await profileRes.json();
        const contestData = await contestRes.json();
        const submissionData = await submissionRes.json();

        setProfile(profileData.result[0]);
        setRatingHistory(contestData.result);
        setSubmissionHistory(submissionData.result);
        setHeatmapData(submissionHistory);
        // Build heatmap data from last 365 days
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setDate(today.getDate() - 364);

        const submissionMap = {};

        submissionData.result.forEach((submission) => {
          const dateStr = new Date(submission.creationTimeSeconds * 1000)
            .toISOString()
            .split("T")[0];
          submissionMap[dateStr] = (submissionMap[dateStr] || 0) + 1;
        });

        const fullYearHeatmap = Array.from({ length: 365 }).map((_, i) => {
          const date = new Date(oneYearAgo);
          date.setDate(oneYearAgo.getDate() + i);
          const dateStr = date.toISOString().split("T")[0];
          return {
            date: dateStr,
            count: submissionMap[dateStr] || 0,
          };
        });

        setHeatmapData(fullYearHeatmap);
      } catch (err) {
        console.error("Error loading Codeforces data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchCodeforcesData();
    }
  }, [username]);

  const handleClick = () => {
    setUsername('');
    navigate("/");
  };

  if (loading) {
    return <p className="text-white text-center text-xl mt-5">Loading...</p>;
  }

  if (!profile || !ratingHistory || !submissionHistory) {
    return <p className="text-red-500 text-2xl text-center">User data not available.</p>;
  }

  const createdAt = new Date(profile.registrationTimeSeconds * 1000);
  const options = { year: "numeric", month: "long" };
  const formattedDate = createdAt.toLocaleDateString("en-US", options);

  const capitalizedMaxRank = profile.maxRank
    ? profile.maxRank.charAt(0).toUpperCase() + profile.maxRank.slice(1)
    : "Unknown";

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}`;
  };
  const chartData = ratingHistory.map((item, index, arr) => {
    const currentRating = item.newRating;
    const previousRating = item.oldRating;
    const direction =
      currentRating >= previousRating
        ? "UP"
        : currentRating < previousRating
        ? "DOWN"
        : "SAME";
    return {
      name: formatDate(item.ratingUpdateTimeSeconds),
      rating: currentRating,
      ranking: Number(item.rank),
      title: item.contestName,
      timestamp: item.ratingUpdateTimeSeconds,
      direction: direction,
    };
  });

  const lastPointIndex = chartData.length - 1;
  const firstYear = +formatDate(chartData[0]?.timestamp);
  const lastYear = +formatDate(chartData[lastPointIndex]?.timestamp);

  const currentData = hoveredData ?? chartData[lastPointIndex];
  if (!currentData) {
    return <p className="text-red-500 text-center">User data not available.</p>;
  }
  return (
    <div className="bg-gray-900 text-white p-6 text-center min-h-screen">
      {/* Profile Info */}
      <div className="mb-8">
        <div className="flex items-center gap-5 justify-center py-5">
          <img
            className="h-30 w-30 lg:w-40 lg:h-40 rounded-full"
            src={profile.titlePhoto || "No User found"}
            alt=""
          />
          <div className="font-medium dark:text-white text-xl">
            <div>
              {`${profile.firstName} ${profile.lastName}` ||
                "No Name Available"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Joined in {formattedDate || "Not Available"}
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-300 my-2">
          Username : {username}
        </h1>
        <p className="text-center text-gray-400 mt-2 lg:text-xl">
          Contest Rank (max) :{" "}
          <span className="font-bold text-xl">{profile.maxRating}</span>{" "}
        </p>
        <p className="text-center text-gray-400 mt-2 text-2xl lg:text-3xl">
          {`Hi 👋, I'm ${profile.firstName} ${profile.lastName}`}
        </p>
        <p className="text-center text-gray-400 mt-2 lg:text-xl">
          {`👨‍💻 ${capitalizedMaxRank} coder from ${profile.country} || Studying at ${profile.organization} || Passionate about problem-solving and improving competitive programming skills.` ||
            "No Bio Available"}
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <div id="calenderblackbox2" className="w-full max-w-3xl bg-[#1e1e1e] text-white p-4 rounded-xl">
          <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-white text-sm sm:text-base">
            <div>
              <p className="text-gray-400">Contest Rating</p>
              <p className=" text-xl lg:text-2xl font-bold flex items-center gap-1">
                {currentData.rating}{" "}
                <span className="text-xl">
                  {currentData.direction === "UP" ? (
                    <img
                      className="w-5 h-5 inline"
                      src={upIcon}
                      alt="up_icon"
                    />
                  ) : (
                    <img
                      className="w-5 h-5 inline"
                      src={downIcon}
                      alt="down_icon"
                    />
                  )}
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
              <p className="font-semibold ">{currentData.title}</p>
            </div>
            <div>
              <p className="text-gray-400">Rank</p>
              <p className="font-semibold">
                {currentData.ranking?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Attended</p>
              <p className="font-semibold">{chartData.length}</p>
            </div>
          </div>
          <div className="w-full h-[260px] lg:h-[400px]">
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
                  chartData[0].timestamp,
                  chartData[lastPointIndex].timestamp,
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
        <div className="bg-[rgb(37,55,69)] pr-3 pl-1 py-1.5 lg:py-2 rounded-xl max-w-4xl w-200">
          <p className="lg:text-xl font-semibold text-black lg:mb-3">Submissions</p>
          <CalendarHeatmap
            startDate={new Date(new Date().setDate(new Date().getDate() - 364))}
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
                "data-tip": `${value.date} — ${value.count || 0} submissions`,
              };
            }}
            showWeekdayLabels={true}
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

export default Codeforces;
