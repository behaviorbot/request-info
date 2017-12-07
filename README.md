# request-info

> a GitHub App built with [probot](https://github.com/probot/probot) that requests more info from newly opened Pull Requests and Issues that contain either default titles or whose description is left blank. It does so by taking data from a `.github/config.yml`.

<img width="1041" alt="screen shot 2017-07-07 at 3 32 01 pm" src="https://user-images.githubusercontent.com/13410355/28132821-d37bf2a8-66f2-11e7-9e7b-5930ba65d67a.png">

## Usage

1. Install the bot on the intended repositories. The plugin requires the following **Permissions and Events**:
- Pull requests: **Read & Write**
  - [x] check the box for **Pull Request** events
- Issues: **Read & Write**
  - [x] check the box for **Issue** events
2. Add a `.github/config.yml` file that contains the following:

```yml
# Configuration for request-info - https://github.com/behaviorbot/request-info

# *OPTIONAL* Comment to reply with
# Can be either a string :
requestInfoReplyComment: >
  We would appreciate it if you could provide us with more info about this issue/pr!

# Or an array:
# requestInfoReplyComment:
#  - Ah no! young blade! That was a trifle short!
#  - Tell me more !
#  - I am sure you can be more effusive


# *OPTIONAL* default titles to check against for lack of descriptiveness
# MUST BE ALL LOWERCASE
requestInfoDefaultTitles:
  - update readme.md
  - updates

# *OPTIONAL* Label to be added to Issues and Pull Requests with insufficient information given
requestInfoLabelToAdd: needs-more-info

# *OPTIONAL* Only warn about insufficient information on these events type
# Keys must be lowercase. Valid values are 'issue' and 'pullRequest'
requestInfoOn:
  pullRequest: true
  issue: true

# *OPTIONAL* Add a list of people whose Issues/PRs will not be commented on
# keys must be GitHub usernames
requestInfoUserstoExclude:
  - hiimbex
  - bexo
```
3. If you' prefer not to add a `.github/config.yml`, you can simply install the bot and it was comment on issues and pull requests with empty bodies with the comment:
```
The maintainers of this repository would appreciate it if you could provide more information.
```

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [the probot deployment docs](https://github.com/probot/probot/blob/master/docs/deployment.md) if you would like to run your own instance of this plugin.
