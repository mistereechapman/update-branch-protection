import { getInput, debug, setFailed } from "@actions/core";
import _request from "@octokit/request";
const { request: orgRequest } = _request;
import { existsSync, readFileSync } from "fs";

var repoName = "";
var branchName = "";

async function run() {
  const token = getInput("token", { required: true });
  const orgName = getInput("organisationName", { required: true });
  const rulesPath = getInput("rulesPath", { required: true });
  repoName = getInput("repositoryName", { required: true });
  branchName = getInput("branchName", { required: false });
  repoName = orgName + "/" + repoName;
  const action = getInput("action", { required: true });
  const canDeleteProtection = action == "set" || action == "delete";
  const canSetProtection = action == "set" || action == "add";

  var rulesObj;
  var branches;
  try {
    if (!existsSync(rulesPath)) {
      throw "Rules JSON is missing.";
    }

    const request = orgRequest.defaults({
      baseUrl: process.env.GITHUB_API_URL || "https://api.github.com",
      headers: {
        authorization: "token " + token,
      },
    });
    const rules = readFileSync(rulesPath, { encoding: "utf8", flag: "r" });
    rulesObj = JSON.parse(rules);
    keys = Object.keys(rulesObj);
    branches = await getBranches(request, repoName, branchName);
    for (let j = 0; j < branches.length; j++) {
      if (branches[j].protected) {
        if (!canDeleteProtection) {
          console.log("Skip Branch Protection for " + branches[j].name + " branch of " + repoName);
          continue;
        }

        console.log("Deleting Branch Protection for " + branches[j].name + " branch of " + repoName);
        debug("Deleting Branch Protection for " + branches[j].name + " branch of " + repoName);
        await deleteProtection(request, repoName, branches[j].name);
      }
      if (canSetProtection) {
        console.log("Setting Branch Protection for " + branches[j].name + " branch of " + repoName);
        debug("Setting Branch Protection for " + branches[j].name + " branch of " + repoName);
        await setProtection(request, repoName, branches[j].name, rulesObj[branches[j].name]);
      }
    }
  } catch (e) {
    console.error(e);
    setFailed(e.stack);
  }
}

async function setProtection(request, repoName, branchName, ruleData) {
  const url = "/repos/" + repoName + "/branches/" + branchName + "/protection";
  if (ruleData == "") {
    ruleData = {
      required_status_checks: None,
      restrictions: {
        users: [],
        teams: [],
      },
    };
  }
  try {
    const result = await request("PUT " + url, {
      data: ruleData,
    });
    debug(result.data);
  } catch (e) {
    console.error(e);
    setFailed("Exception Occurred in Set Protection: " + e.stack);
  }
}

async function deleteProtection(request, repoName, branchName) {
  const url = "/repos/" + repoName + "/branches/" + branchName + "/protection";
  try {
    const result = await request("DELETE " + url);
    if (result.status != 204) {
      throw "Exception occurred during Delete Protection";
    }
  } catch (e) {
    console.error(e);
    setFailed("Exception Occurred in Delete Protection: " + e.stack);
  }
}

async function getBranches(request, repoName, branchName) {
  branchInfoArr = [];
  const url = "/repos/" + repoName + "/branches";
  try {
    const result = await request("GET " + url);
    branchData = result.data;
    for (let j = 0; j < branchData.length; j++) {
      const element = branchData[j];
      if (branchName == element.name) {
        branchInfoArr.push(element);
      }
    }
  } catch (e) {
    console.error(e);
    setFailed("Exception Occurred in Get Branches: " + e.stack);
  }
  return branchInfoArr;
}

run();
