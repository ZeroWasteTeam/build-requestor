var htmlInterface = {
    getToken: function () { 
        return document.getElementById("form-token").value;
    },

    getOrganization:function () { 
        return document.getElementById("form-organization").value;
    },

    getRepository:function () {
        return document.getElementById("form-repository").value;
    },

    getBranch:function () { 
        return document.getElementById("form-branch").value;
    },

    getCommitId:function () { 
        return document.getElementById("form-commitId").value;
    },

    setError:function (error) {
        document.getElementById("error").innerHTML = error;
    },

    setRepositoryNames: function(repositories) {    
        setSelectOptions("form-repository", repositories);
    },

    setBranchNames: function(branches) {
        setSelectOptions("form-branch", branches);
    },

    setCommitIds: function(commitIds) {
        setSelectOptions("form-commitId", commitIds);
    }
};


module.exports = htmlInterface

function setSelectOptions(id, names) {
    let x = document.getElementById(id);
    let length = x.options.length;
    for (i = length - 1; i >= 0; i--) {
        x.options[i] = null;
    }
    console.log("cleared :"+id);
    console.log("setting :"+id);
    console.log(names);
    names.forEach(name => {
        var option = document.createElement("option");
        option.text = name;
        x.add(option, x[0]);
    });
}
