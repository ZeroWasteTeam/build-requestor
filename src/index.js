var htmlInterface = require('./htmlInterface');
const axios = require('axios');

module.exports = {
    onPageLoad: function () {
        disableButton();
        console.log("Page loaded started");
        populateToken();
        populateOrganziation();
        onBasicInputChangeAsync()
            .then(x => console.log("Page Load Completd Successfully"))
            .catch(x => {
                htmlInterface.setError(x.message);
                console.log(`Page load completed with errors : ${x.message}`);
            });
    },

    onTokenChange: function () {
        disableButton();
        console.log("Token has been changed");
        persistToken();
        onBasicInputChangeAsync()
            .then(x => console.log("Token Change completed successfully"))
            .catch(x => {
                htmlInterface.setError(x.message);
                console.log(`Token change completed with errors: ${x.message}`);
            });
    },

    onOrganizationChange: function () {
        disableButton();
        console.log("Organization has been changed");
        persistOrganization();
        onBasicInputChangeAsync()
            .then(x => console.log("Organziation Change completed successfully"))
            .catch(x => {
                console.log("Organziation Change completed with errors: " + x.message);
                htmlInterface.setError(x.message);
            });
    },

    onRepositoryChange: function () {
        disableButton();
        console.log("Repository has been changed");
        onRepoChangeAsync()
            .then(x => console.log("Repository Change completed successfully"))
            .catch(x => {
                console.log("Repository Change completed with errors: " + x.message);
                htmlInterface.setError(x.message);
            });
    },

    onBranchChange: function() {
        disableButton();
        console.log("Branch has been changed");
        onBranchChangeAsync()
            .then(x => console.log("Branch Change completed successfully"))
            .catch(x => {
                console.log("Branch Change completed with errors: " + x.message);
                htmlInterface.setError(x.message);
            });
    },

    onCommitIdChange: function() {
        disableButton();
        console.log("CommitId has been changed");
        onCommitIdChangeAsync()
            .then(x => console.log("CommitId Change completed successfully"))
            .catch(x => {
                console.log("CommitId Change completed with errors: " + x.message);
                htmlInterface.setError(x.message);
            });
    },

    onSubmit: function() {
        onSubmitAsync()
            .then(console.log("Submitted successfully"))
            .catch(x =>{
                console.log("There is an error in submitting: "+x.message);
                htmlInterface.setError(x.message);
            });
    }
};

async function onSubmitAsync(){
    try {

        let payload = `{ "event_type": "rebuild", "client_payload":{ "buildBranch" : "${htmlInterface.getBranch()}", "buildSha":"${htmlInterface.getCommitId()}" }}`;
        let res = await axios.post(`https://api.github.com/repos/${htmlInterface.getOrganization()}/${htmlInterface.getRepository()}/dispatches`, payload, getHeaders(htmlInterface.getToken()));
        console.log("success");
    } catch (e) {
        console.log("exception "+e);
        console.log(e);
        //if (e.response.status == 404) throw new Error("The branch is invalid. (It could be that the organization/repo is invalid)");
        //if (e.response.status == 401) throw new Error("The token is not authorized");
        //throw new Error("There may be a problem with the token or organization or repo or branch");
    }
} 

function disableButton(){
    document.getElementById("submit").disabled = true;
}

function enableButton(){
    document.getElementById("submit").disabled = false;
}

async function onBasicInputChangeAsync(){
    await clear(repo = true, branch = true, commitId = true);
    let h = htmlInterface;
    await assertInputsAreCorrect(h.getToken(), h.getOrganization());
    let repositoryNames = await getRepositoryNames();
    if(repositoryNames.length == 0) throw new Error("There are no repos in this organization");
    htmlInterface.setRepositoryNames(repositoryNames);
    await onRepoChangeAsync();
}

async function onRepoChangeAsync(){
    await clear(repo = false, branch = true, commitId = true);
    let h = htmlInterface;
    await assertInputsAreCorrect(h.getToken(), h.getOrganization(), h.getRepository());
    let branchNames = await getBranchNames();
    if(branchNames.length == 0) throw new Error('This repository does not contain any branches');
    htmlInterface.setBranchNames(branchNames);
    await onBranchChangeAsync();
}

async function onBranchChangeAsync(){

    await clear(repo = false, branch = false, commitId = true);
    let h = htmlInterface;
    await assertInputsAreCorrect(h.getToken(), h.getOrganization(), h.getRepository(), h.getBranch());
    let commitIds = await getCommitIds();
    if(commitIds.length == 0) throw new Error("There are no commits in this branch");
    htmlInterface.setCommitIds(commitIds);
    await onCommitIdChangeAsync();

}

async function onCommitIdChangeAsync() {
    let h = htmlInterface;
    await assertInputsAreCorrect(h.getToken(), h.getOrganization(), h.getRepository(), h.getBranch(), h.getCommitId());
    enableButton();
}


function persistToken() {
    var token = htmlInterface.getToken();
    let localStorageToken = localStorage.getItem("token");
    if (token == null) token = "";
    if (localStorageToken != token)
        localStorage.setItem("token", token);
}

function persistOrganization() {
    var organization = htmlInterface.getOrganization();
    let localStorageOrganization = localStorage.getItem("organization");
    if (organization == null) organization = "";
    if (localStorageOrganization != organization)
        localStorage.setItem("organization", organization);
}

function populateToken() {
    let token = localStorage.getItem("token");
    if (token != null) {
        document.getElementById('form-token').value = token;
    }
}

function populateOrganziation() {
    let organziation = localStorage.getItem("organization");
    if (organziation != null) {
        document.getElementById('form-organization').value = organziation;
    }
}

async function clear(repo = false, branch = false, commitId = false){
    htmlInterface.setError("");
    console.log(`clear parameters repo:${repo} branch:${branch} commitId:${commitId}`);
    if(repo == true) htmlInterface.setRepositoryNames([]);
    if(branch == true) htmlInterface.setBranchNames([]);
    if(commitId == true) htmlInterface.setCommitIds([]);
}

async function assertInputsAreCorrect(token = null, organization = null, repo = null, branch = null, commitId = null) {
    await assertTokenIsValid(token);

    if(organization == null) return;
    await assertOrganizationIsValid(token, organization);

    if(repo == null) return;
    await assertRepoIsValid(token, organization, repo);

    if(branch == null) return;
    await assertBranchIsValid(token, organization, repo, branch);
    
    if(commitId == null) return;
    await assertCommitIdIsValid(token, organization, repo, branch, commitId);

}

async function assertCommitIdIsValid(token, organization, repo, branch, commitId) {
    if(commitId == "") throw new Error("The commit id is empty");
    //At this point, we would like to assume that it's correct        
}


async function assertBranchIsValid(token, organization, repo, branch) {
    if(branch == "") throw new Error("The branch is empty");
    try {
        let res = await axios.get(`https://api.github.com/repos/${organization}/${repo}/branches/${branch}`, getHeaders(token));
    } catch (e) {
        if (e.response.status == 404) throw new Error("The branch is invalid. (It could be that the organization/repo is invalid)");
        if (e.response.status == 401) throw new Error("The token is not authorized");
        throw new Error("There may be a problem with the token or organization or repo or branch");
    }
}


async function assertRepoIsValid(token, organization, repo) {
    if(repo == "") throw new Error ("The repo is empty");
    try {
        let res = await axios.get(`https://api.github.com/repos/${organization}/${repo}`, getHeaders(token));
    } catch (e) {
        if (e.response.status == 404) throw new Error("The repo is invalid. (It could be that the organization is invalid)");
        if (e.response.status == 401) throw new Error("The token is not authorized");
        throw new Error("There may be a problem with the token or organization or repo");
    }
}


async function assertOrganizationIsValid(token, organization){
    if (organization == "") throw new Error("The organization is empty");
    try {
        let res = await axios.get(`https://api.github.com/orgs/${organization}`, getHeaders(token));
    } catch (e) {
        if (e.response.status == 404) throw new Error("The organization is invalid");
        if (e.response.status == 401) throw new Error("The token is not authorized");
        throw new Error("There may be a problem with the token or organization");
    }
}

async function assertTokenIsValid(token) {
    if (token == "") throw new Error("The token is empty");
    try {
        let res = await axios.get("https://api.github.com/user", getHeaders(token));
    } catch (e) {
        if (e.response.status == 401)
            throw new Error("The token is incorrect");
        throw new Error("There may be a problem with the token");
    }
}

async function getCommitIds() {
    let organizationName = htmlInterface.getOrganization();
    let repoName = htmlInterface.getRepository();
    let branchName = htmlInterface.getBranch();
    try {
        let res = await axios.get(`https://api.github.com/repos/${organizationName}/${repoName}/commits?sha=${branchName}`, getConfig());
        return res.data.map(x => x.sha);
    } catch (e) {
        if (e.response.status == 404)
            throw new Error("The repoName is not found");
        throw new Error("There may be a problem with the repoName");
    }
}

async function getBranchNames() {
    let organizationName = htmlInterface.getOrganization();
    let repoName = htmlInterface.getRepository();
    try {
        let res = await axios.get(`https://api.github.com/repos/${organizationName}/${repoName}/branches`, getConfig());
        return res.data.map(x => x.name);
    } catch (e) {
        if (e.response.status == 404)
            throw new Error("The repoName is not found");
        throw new Error("There may be a problem with the repoName");
    }
}

async function getRepositoryNames() {
    let organizationName = htmlInterface.getOrganization();
    try {
        let res = await axios.get(`https://api.github.com/orgs/${organizationName}/repos`, getConfig());
        return res.data.map(x => x.full_name).map(x => x.replace(`${organizationName}/`, ''));
    } catch (e) {
        if (e.response.status == 404)
            throw new Error("The organization is not found");
        throw new Error("There may be a problem with the organization");
    }
    return repositoryNames;
}

function getConfig() {
    return {
        headers: {
            'Authorization': `token ${htmlInterface.getToken()}`,
            'Accept': 'application/vnd.github+json',
        }
    };
}

function getHeaders(token) {
    return {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github+json',
        }
    };
}
