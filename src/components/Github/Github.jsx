import { useState, useEffect } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUsername } from '../../Username.jsx';

function Github() {
  
  const { username, setUsername } = useUsername();
  const [data, setData] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      return;
    }
    setLoading(true);
    const fetchData = async () => {
      try {
        const userResponse = await fetch(
          `https://api.github.com/users/${username}`
        );
        const userData = await userResponse.json();
        if (userData.message === "Not Found") {
          alert("User not found!");
          setLoading(false);
          return;
        }
        setData(userData);

        // organization
        const orgResponse = await fetch(userData.organizations_url);
        const orgData = await orgResponse.json();
        setOrganizations(orgData);

        // repo
        const repoResponse = await fetch(userData.repos_url);
        const repoData = await repoResponse.json();
        setRepositories(repoData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [username]);
  const handleClick = () => {
    setUsername('');
    navigate("/");
  };

  if (loading) {
    return <p className="text-white text-xl text-center mt-5">Loading...</p>;
  }

  if (!data) {
    return <p className="text-red-500 text-xl text-center">User data not available.</p>;
  }

  const createdAt = new Date(data.created_at);
  const options = { year: "numeric", month: "long" };
  const formattedDate = createdAt.toLocaleDateString("en-US", options);

  return (
    <div className="text-center bg-gray-900">
      <div class="flex items-center gap-5 justify-center py-5">
        <img
          class="h-30 w-30 lg:w-40 lg:h-40 rounded-full"
          src={data.avatar_url || "No User found"}
          alt=""
        />
        <div class="font-medium dark:text-white text-xl">
          <div>{data.name || "No Name Available"}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Joined in {formattedDate || "Not Available"}
          </div>
        </div>
      </div>
      <h1 className="text-xl font-bold text-gray-300">
        Username : {username}{" "}
      </h1>
      <p className="text-center text-gray-400 mt-2 text-l px-2 lg:text-2xl">
        {data.bio || "No Bio Available"}
      </p>
      <p className="mt-2 font-bold text-gray-500">
        Followers: {data.followers} | Following: {data.following}
      </p>

      {/* Organizations */}
      {organizations.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-500">Organizations</h2>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {organizations.map((org) => (
              <div key={org.id} className="text-center p-2 text-white">
                <img
                  src={org.avatar_url}
                  alt={org.login}
                  className="w-12 rounded-md mx-auto"
                />
                <p className="text-sm">{org.login}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repositories */}
      {repositories.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md w-[90%] max-w-4xl">
            <h3 className="text-lg font-bold text-white border-b border-gray-600 pb-2 text-center">
              Repositories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
              {repositories.map((repo, index) => {
                const isLastOdd =
                  repositories.length % 2 === 1 &&
                  index === repositories.length - 1;
                return (
                  <div
                    key={repo.id}
                    className={`flex justify-between items-center bg-gray-700 p-2 rounded-md shadow-sm my-0.5 ${
                      isLastOdd ? "md:col-span-2 md:mx-auto md:w-1/2" : ""
                    }`}
                  >
                    {/* Repo Name & Created Date */}
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-white font-medium">
                        {repo.name}
                      </span>
                      <span className="text-gray-400">
                        [ {repo.created_at.slice(0, 10)} ]
                      </span>
                    </div>

                    {/* GitHub Link with Icon */}
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-500"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                        alt="GitHub"
                        className="w-4 h-4"
                      />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/*Gith status*/}
      <div className="flex flex-col items-center justify-center p-5">
        <div className="p-3 self-start lg:mx-31">
          <h2 className="text-white font-bold text-xl">My Github Stats</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <a>
            <img
              title="🔥 Get streak stats for your profile at git.io/streak-stats"
              alt={`${data.name} streak`}
              src={`https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=dark&border_radius=15&date_format=M%20j%5B%2C%20Y%5D&background=060A0CD0`}
              className="mb-4 h-40"
            />
          </a>
          <a href={`https://github.com/${username}/github-readme-stats`}>
            <img
              alt="Top Languages"
              src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&langs_count=8&count_private=true&layout=compact&theme=dark&border_radius=10&bg_color=0D1117`}
              className="mb-4 h-40"
            />
          </a>
          <a href={`https://github.com/${username}/github-readme-stats`}>
            <img
              alt={`${data.name} Github Stats`}
              src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&count_private=true&theme=dark&border_radius=15&bg_color=060A0CD0`}
              className="mb-4 h-40"
            />
          </a>
        </div>
        <a href={`https://github.com/${username}/github-readme-activity-graph`}>
          <img
            className="w-220 lg:h-70"
            alt={`${data.name} Github Last 30 Day Graph`}
            src={`https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=react-dark&color=ffffff&line=BABDC2&point=E2EAF4&area=true`}
          />
        </a>
      </div>

      {/* Reload Button */}
      <button
        onClick={handleClick}
        className="bg-red-500 text-white p-2 mt-4 rounded-md my-6"
      >
        Go to Home
      </button>
    </div>
  );
}

export default Github;
