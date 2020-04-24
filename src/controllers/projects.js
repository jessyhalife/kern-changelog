import axios from "axios";

var ProjectController = {
  getProjects: async () => {
    return axios.get("https://gitlab.com/api/v4/groups/3291864/projects", {
      method: "GET",
      headers: {
        "PRIVATE-TOKEN": "QPMEZZky8yBAkiQwQjT6",
      },
    });
  },
  getProjectInfo: async (id, url, name, branch) => {
    var branches = require("../const");
    if (!branch) branch = branches[name];
    if (!url)
      url = `https://gitlab.com/api/v4/projects/${id}/merge_requests?state=merged&per_page=1000&target_branch=${branch}`;
    return axios.get(url, {
      method: "GET",
      headers: {
        "PRIVATE-TOKEN": "QPMEZZky8yBAkiQwQjT6",
      },
    });
  },
  getBranches: async (id, url) => {
    if (!url)
      url = `https://gitlab.com/api/v4/projects/${id}/repository/branches?search=release`;
    return axios.get(url, {
      method: "GET",
      headers: {
        "PRIVATE-TOKEN": "QPMEZZky8yBAkiQwQjT6",
      },
    });
  },
};

export default ProjectController;
