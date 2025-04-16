import React, { useContext, useEffect, useState } from "react";
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

function Leetcode() {
  const { username } = useParams();
  const { setUsername } = useContext(UsernameContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [solved, setSolved] = useState(null);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState(null);
  const [submission, setSubmission] = useState([]);
  const [hoveredValue, setHoveredValue] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  const baseUrl = "https://alfa-leetcode-api.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          profileRes,
          problemsRes,
          badgesRes,
          solvedRes,
          contestRes,
          submissionRes,
        ] = await Promise.all([
          fetch(`${baseUrl}/${username}`),
          fetch(`${baseUrl}/problems`),
          fetch(`${baseUrl}/${username}/badges`),
          fetch(`${baseUrl}/${username}/solved`),
          fetch(`${baseUrl}/${username}/contest`),
          fetch(`${baseUrl}/${username}/calendar`),
        ]);

        const profileData = await profileRes.json();
        const badgesData = await badgesRes.json();
        const solvedData = await solvedRes.json();
        const contestData = await contestRes.json();
        const problems = await problemsRes.json();
        const submission = await submissionRes.json();

        setProfile(profileData);
        setBadges(badgesData.badges || []);
        setSolved(solvedData);
        setContest(contestData);
        setProblems(problems);
        setSubmission(submission);
        let submissionData = submission.submissionCalendar;
        if (typeof submissionData === "string") {
          submissionData = JSON.parse(submissionData);
        }

        const heatmapArray = Object.keys(submissionData).map((timestamp) => {
          const date = new Date(parseInt(timestamp) * 1000)
            .toISOString()
            .split("T")[0];
          return {
            date,
            count: submissionData[timestamp],
          };
        });

        setHeatmapData(heatmapArray);
      } catch (err) {
        console.error("Error loading LeetCode data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

  const handleClick = () => {
    setUsername('');
    navigate("/");
  };

  if (loading) {
    return <p className="text-white text-center text-xl mt-5">Loading...</p>;
  }
  if (!profile || !solved || !contest) {
    return <p className="text-red-500 text-xl text-center">User data not available.</p>;
  }
  const totalSolved = solved.solvedProblem;
  const { easySolved, mediumSolved, hardSolved } = solved;
  const { totalEasy, totalMedium, totalHard } = {
    totalEasy: 871,
    totalMedium: 1821,
    totalHard: 819,
  };
  const totalQuestions = problems.totalQuestions;

  const totalValue = totalQuestions;
  const circleRadius = 90;
  const circumference = 2 * Math.PI * circleRadius;
  const attempting = 18;

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
  };
  const difficulties = [
    {
      label: "Easy",
      solved: easySolved,
      total: totalEasy,
      color: "#06b6d4",
      bg: "rgba(0,96,100, 0.3)",
    },
    {
      label: "Medium",
      solved: mediumSolved,
      total: totalMedium,
      color: "#facc15",
      bg: "rgba(245, 127, 23, 0.3)",
    },
    {
      label: "Hard",
      solved: hardSolved,
      total: totalHard,
      color: "#ef4444",
      bg: "rgba(183, 28, 28, 0.3)",
    },
  ];

  // for graph
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}`;
  };

  const chartData = contest.contestParticipation.map((item) => ({
    name: formatDate(item.contest.startTime),
    rating: item.rating,
    ranking: item.ranking,
    direction: item.trendDirection,
    problemsolved: item.problemsSolved,
    totalproblem: item.totalProblems,
    title: item.contest.title,
    timestamp: item.contest.startTime,
  }));

  const lastPointIndex = chartData.length - 1;
  const firstYear = +formatDate(chartData[0].timestamp);
  const lastYear = +formatDate(chartData[lastPointIndex].timestamp);

  const currentData = hoveredData ?? chartData[lastPointIndex];
  return (
    <div className="bg-gray-900 text-white p-6 text-center min-h-screen">
      {/* Profile Info */}
      <div className="mb-8">
        <div class="flex items-center gap-5 justify-center py-5">
          <img
            class="h-30 w-30 lg:w-40 lg:h-40 rounded-full"
            src={profile.avatar || "No User found"}
            alt=""
          />
          <div class="font-medium dark:text-white text-xl">
            <div>{profile.name || "No Name Available"}</div>
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-300 my-2">
          Username : {username}{" "}
        </h1>
        <p className="text-center text-gray-400 mt-2 text-l">
          Ranking: <span className="font-bold">{profile.ranking}</span>
        </p>
        <p className="text-center text-gray-400 mt-2 text-l">
          {profile.about || "No Bio Available"}
        </p>
      </div>

      {/* SolvedSection */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-10 translate-x-2">
        {/* Circular Ring */}
        <div className="relative w-44 h-44">
          <svg
            className="w-full h-full transition-all duration-300"
            viewBox="0 0 200 200"
          >
            <g>
              <circle
                cx="100"
                cy="100"
                r={circleRadius}
                stroke={hoveredValue ? hoveredValue.bg : "#212121"}
                strokeWidth="10"
                fill="none"
              />
              {hoveredValue && (
                <path
                  d={describeArc(
                    100,
                    100,
                    circleRadius,
                    0,
                    (hoveredValue.solved / hoveredValue.total) * 360
                  )}
                  stroke={hoveredValue.color}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {!hoveredValue &&
                difficulties.map((diff, i) => {
                  const startAngle = i * 120;
                  const endAngle =
                    startAngle + (diff.solved / diff.total) * 120;
                  return (
                    <path
                      key={diff.label}
                      d={describeArc(
                        100,
                        100,
                        circleRadius,
                        startAngle,
                        endAngle
                      )}
                      stroke={diff.color}
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                    />
                  );
                })}
            </g>
          </svg>

          {/* Center Content */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-2xl font-bold">
              {hoveredValue ? hoveredValue.solved : totalSolved}
              <span className="text-base">
                /{hoveredValue ? hoveredValue.total : totalQuestions}
              </span>
            </div>
            <div className="text-green-400 text-sm">✔ Solved</div>
          </div>
          <div className="text-gray-400 text-sm mt-2 ml-2">
            {attempting} Attempting
          </div>
        </div>

        {/* Easy, Medium, Hard Bars */}
        <div className="w-full max-w-xs text-left text-sm space-y-4">
          <div
            onMouseEnter={() =>
              setHoveredValue({
                solved: easySolved,
                total: totalEasy,
                color: "cyan",
                bg: "rgba(0,96,100, 0.3)",
              })
            }
            onMouseLeave={() => setHoveredValue(null)}
          >
            <div className="flex justify-between text-cyan-400">
              <span>Easy</span>
              <span>
                {easySolved}/{totalEasy}
              </span>
            </div>
            <div className="w-full bg-cyan-900 h-1 rounded-full">
              <div
                className="bg-cyan-400 h-1 rounded-full"
                style={{ width: `${(easySolved / totalEasy) * 100}%` }}
              />
            </div>
          </div>

          <div
            onMouseEnter={() =>
              setHoveredValue({
                solved: mediumSolved,
                total: totalMedium,
                color: "yellow",
                bg: "rgba(245, 127, 23, 0.3)",
              })
            }
            onMouseLeave={() => setHoveredValue(null)}
          >
            <div className="flex justify-between text-yellow-400">
              <span>Medium</span>
              <span>
                {mediumSolved}/{totalMedium}
              </span>
            </div>
            <div className="w-full bg-yellow-900 h-1 rounded-full">
              <div
                className="bg-yellow-400 h-1 rounded-full"
                style={{ width: `${(mediumSolved / totalMedium) * 100}%` }}
              />
            </div>
          </div>

          <div
            onMouseEnter={() =>
              setHoveredValue({
                solved: hardSolved,
                total: totalHard,
                color: "red",
                bg: "rgba(183, 28, 28, 0.3)",
              })
            }
            onMouseLeave={() => setHoveredValue(null)}
          >
            <div className="flex justify-between text-red-400">
              <span>Hard</span>
              <span>
                {hardSolved}/{totalHard}
              </span>
            </div>
            <div className="w-full bg-red-900 h-1 rounded-full">
              <div
                className="bg-red-500 h-1 rounded-full"
                style={{ width: `${(hardSolved / totalHard) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length >= 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Badges</h2>
          <div className="flex justify-center flex-wrap gap-4 mt-4">
            {badges.map((badge, idx) => {
              const iconUrl = badge.icon.startsWith("/")
                ? `https://leetcode.com${badge.icon}`
                : badge.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-800 p-3 rounded-lg text-center w-24"
                >
                  <img
                    src={iconUrl}
                    alt={badge.displayName}
                    className="w-10 h-10 mx-auto mb-2"
                  />
                  <p className="text-sm text-white">{badge.displayName}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contest Info */}
      <div className="mb-6 flex justify-center">
        <div id="calenderblackbox" className="w-full max-w-3xl bg-[#1e1e1e] text-white p-4 rounded-xl ">
          <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-white text-sm sm:text-base">
            <div>
              <p className="text-gray-400">Contest Rating</p>
              <p className="text-xl lg:text-2xl font-bold flex items-center gap-1">
                {Math.round(currentData.rating)}{" "}
                <span className="text-xl">
                  {currentData.direction === "UP" ? (
                    <img className="w-5 h-5 inline" src={upIcon} alt="" />
                  ) : (
                    <img className="w-5 h-5 inline" src={downIcon} />
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
              <p className="font-semibold">{currentData.title}</p>
            </div>
            <div>
              <p className="text-gray-400">Global Ranking</p>
              <p className="font-semibold text-sm">
                {contest.contestGlobalRanking.toLocaleString()} /{" "}
                {contest.totalParticipants.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Rank</p>
              <p className="font-semibold">
                {currentData.ranking?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Top</p>
              <p className="font-semibold">{contest.contestTopPercentage}%</p>
            </div>
            <div>
              <p className="text-gray-400">Solved</p>
              <p className="font-semibold">
                {currentData.problemsolved} / {currentData.totalproblem}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Attended</p>
              <p className="font-semibold">{contest.contestAttend}</p>
            </div>
          </div>
          <div className="w-full h-[240px] lg:h-[400px]">
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

export default Leetcode;
