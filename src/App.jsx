import { useState, useEffect } from "react";
import "./styles/App.scss";
// import db from "./data/db.json";
import { JobsFull } from "./components/JobsFull";
import { JobsList } from "./components/JobsList";
import md5 from "md5";
import { AddJob } from "./components/AddJob";
import jobs from "./data/jobs.json";
import jobSites from "./data/jobSites.json";

const jobsUrl =
  "https://react-firststreamingapp-default-rtdb.firebaseio.com/jobs.json";
const jobSitesUrl =
  "https://react-firststreamingapp-default-rtdb.firebaseio.com/jobSites.json";

// _jobs.forEach((job) => {
//   job.status = "accepted";
// });

console.log(jobs, jobSites);

const techItemsUrl = "https://edwardtanguay.netlify.app/share/techItems.json";

const statuses = ["send", "wait", "interview", "declined", "accepted"];
export const displayKinds = ["list", "full", "addJob"];

function App() {
  const [displayKind, setDisplayKind] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobSites, setJobSites] = useState([]);
  const [techItems, setTechItems] = useState([]);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(true);
  const [fieldLogin, setFieldLogin] = useState("");
  const [fieldPassword, setFieldPassword] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [userGroup, setUserGroup] = useState("fullAccessMembers");

  // const saveToLocalStorage = () => {
  //   if (displayKind !== "") {
  //     const jobAppState = {
  //       displayKind,
  //       // jobs,
  //     };
  //     localStorage.setItem("jobAppState", JSON.stringify(jobAppState));
  //   }
  // };

  // const loadLocalStorage = () => {
  //   const jobAppState = JSON.parse(localStorage.getItem("jobAppState"));
  //   if (jobAppState === null) {
  //     setDisplayKind("list");
  //   } else {
  //     setDisplayKind(jobAppState.displayKind);
  //   }
  // };

  // !! jobs.json and jobSites.json to firebase added.. !!!

  const saveJobsToFirebase = async () => {
    fetch(jobsUrl, {
      method: "POST",
      body: JSON.stringify(jobs),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });
  };

  const saveJobSitesToFirebase = async () => {
    fetch(jobSitesUrl, {
      method: "POST",
      body: JSON.stringify(jobSites),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });
  };

  saveJobsToFirebase();
  saveJobSitesToFirebase();

  const loadTechItems = () => {
    (async () => {
      const response = await fetch(techItemsUrl);
      const data = await response.json();
      setTechItems(data);
    })();
  };

  const loadJobs = () => {
    (async () => {
      const response = await fetch(jobsUrl);
      const _jobs = await response.json();
      setJobs(_jobs);
    })();
  };

  const loadJobSites = () => {
    (async () => {
      const response = await fetch(jobSitesUrl);
      const _jobSites = await response.json();
      setJobSites(_jobSites);
    })();
  };

  useEffect(() => {
    loadJobs();
    loadJobSites();
    loadTechItems();
  }, []);

  useEffect(() => {
    saveToLocalStorage();
  }, [displayKind, jobs]);

  const handleToggleView = () => {
    let displayKindIndex = displayKinds.indexOf(displayKind);
    displayKindIndex++;
    if (displayKindIndex > displayKinds.length - 1) {
      displayKindIndex = 0;
    }
    setDisplayKind(displayKinds[displayKindIndex]);
    loadJobs();
  };

  const saveJobStatusToDb = async (job) => {
    const requestOptions = {
      method: "PATCH",
      body: JSON.stringify({ status: job.status }),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    };
    try {
      await fetch(jobsUrl + "/" + job.id, requestOptions);
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleStatusChange = (job) => {
    let statusIndex = statuses.indexOf(job.status);
    statusIndex++;
    if (statusIndex > statuses.length - 1) {
      statusIndex = 0;
    }
    job.status = statuses[statusIndex];
    setJobs([...jobs]);
    saveJobStatusToDb(job);
  };

  const handleSubmitButton = (e) => {
    e.preventDefault();
    const hash = md5(fieldPassword);

    if (fieldLogin === "me" && hash === "8c6744c9d42ec2cb9e8885b54ff744d0") {
      setUserGroup("fullAccessMembers");
      setUserIsLoggedIn(true);
      setFormMessage("");
    } else {
      setFormMessage("bad login");
    }

    if (fieldLogin === "guest" && hash === "7ce3284b743aefde80ffd9aec500e085") {
      setUserGroup("guests");
      setUserIsLoggedIn(true);
      setFormMessage("");
      setDisplayKind("list");
    } else {
      setFormMessage("bad login");
    }

    setFieldLogin("");
    setFieldPassword("");
  };

  const handleFieldLogin = (e) => {
    setFieldLogin(e.target.value);
  };

  const handleFieldPassword = (e) => {
    setFieldPassword(e.target.value);
  };

  const handleLogoutButton = () => {
    setFormMessage("");
    setUserIsLoggedIn(false);
  };

  return (
    <div className="App">
      <h1>Job Application Process</h1>
      {userIsLoggedIn ? (
        <>
          <div className="buttonArea">
            {userGroup === "fullAccessMembers" && (
              <button className="btn_normal" onClick={handleToggleView}>
                Toggle View
              </button>
            )}
            <button className="btn_logout" onClick={handleLogoutButton}>
              Logout
            </button>
          </div>
          {displayKind === "full" && (
            <JobsFull
              jobs={jobs}
              handleStatusChange={handleStatusChange}
              techItems={techItems}
            />
          )}
          {displayKind === "list" && <JobsList jobs={jobs} />}
          {displayKind === "addJob" && (
            <AddJob jobsUrl={jobsUrl} jobSitesUrl={jobSitesUrl} />
          )}
        </>
      ) : (
        <form>
          <fieldset>
            <legend>Welcome</legend>
            {formMessage !== "" && (
              <div className="formMessage">{formMessage}</div>
            )}
            <div className="row">
              <label htmlFor="login2">Login</label>
              <input
                value={fieldLogin}
                onChange={handleFieldLogin}
                autoFocus
                type="text"
                id="login2"
              />
              {fieldLogin.trim().length === 0 && (
                <div className="fieldNote">required</div>
              )}
            </div>
            <div className="row">
              <label htmlFor="password">Password</label>
              <input
                value={fieldPassword}
                onChange={handleFieldPassword}
                type="password"
                id="password"
              />
              {fieldPassword.trim().length === 0 && (
                <div className="fieldNote">required</div>
              )}
            </div>
            <div className="buttonRow">
              <button
                disabled={
                  fieldLogin.trim().length === 0 ||
                  fieldPassword.trim().length === 0
                }
                onClick={handleSubmitButton}
              >
                Enter
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}

export default App;
