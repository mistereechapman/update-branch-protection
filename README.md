# Set / Delete Branch Protection

This action will set / delete Branch Protection rules on specified branches of GitHub repository within an organization. This action, when included in a workflow will help automate the branch protection rules consistently across the repository within an organization. Same rules will get applied on the specified branches for the GitHub Repositories of an organization. The Rules JSON (format provided below in the inputs) should have the branches and rules as key value pairs. The below JSON sample specifies the rules for Main and Release branches. The token used below should be of an Admin user. This action is written using pure JavaScript and Node and hence will work on any runner. 

**Note**: Use this action after the Checkout step in your workflow, since we are specifying the paths of rules JSON and other files and we have to make sure the files are available for use by this action. Hence it is recommended to use this action after the Checkout step. This will remove the existing rules and set the rules based on the JSON. Even for newly provisioned repositories, you can use this action in a workflow with some schedule to consistently apply branch protection rules without any manual intervention.

# Inputs

### `token`
**Required**  
**Description** - This should be the token of a GitHub Admin / Organization Owner to be able to manage all repos within the organization, passed as a secret.

### `organisationName`
**Required**  
**Description** - Name of your GitHub Organization.  

### `repositoryName`
**Required**  
**Description** - Name of your GitHub repository

### `branchName`
**Required**  
**Description** - Name of your targetted branch

### `rulesPath`
**Required**  
**Description** - The path of the Rules JSON file with Branch name as Key and Rules as Value. Format of the file is given below. The below JSON applies branch protection rules to release and main branches of a repo.

```
{ 
    "release" : {
    "restrictions": {
                        "users": [""],
                        "teams": [""]
                    },                              
    "required_status_checks": null,
    "enforce_admins": true,
    "required_linear_history": true,
    "required_pull_request_reviews": {
      "dismiss_stale_reviews": true
    }
  },
  "main": {
    "restrictions":null,                              
    "required_status_checks": null,
    "enforce_admins": null,
    "required_linear_history": null,
    "required_pull_request_reviews": {
      "dismiss_stale_reviews": true
    }
  }
}
```

### `action`
**Description** - This GitHub Custom action can be used to set / add / delete branch protection. The default value is set (if not specified). If add is assigned, it will add branch protection to every repo, if branch protection is not applied. If delete is assigned, it will remove branch protection from every repo, if branch protection is already applied.
**Default** - 'set'

# Usage

```

- name: Run Branch Protection
  uses: mistereechapman/branch-protection@v1
  with:
    token: '${{ secrets.GITHUB_ADMIN_ACCESS_TOKEN }}' 
    organisationName: Name-Of-Your-GitHub-Organization
    repositoryName: Name-Of-Your-Repository
    branchName: Name-Of-Targetted-Branch
    rulesPath: ./rules.json 
    action: set
```
# License

This project is released under the [MIT License](LICENSE)
