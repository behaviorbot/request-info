# request-info

> a GitHub App built with [probot](https://github.com/probot/probot) that requests more info from newly opened Pull Requests and Issues that contain either default titles or whose description is left blank. It does so by taking data from a file located in a `.github/request-info.md` and replying with the contents of that file.

<img width="1041" alt="screen shot 2017-07-07 at 3 32 01 pm" src="https://user-images.githubusercontent.com/13410355/28132821-d37bf2a8-66f2-11e7-9e7b-5930ba65d67a.png">

## Usage

1. Install the bot on the intended repositories. The plugin requires the following **Permissions and Events**:
- Pull requests: **Read & Write**
  - [x] check the box for **Pull Request** events
- Issues: **Read & Write**
  - [x] check the box for **Issue** events
2. Add a `.github/request-info.md` file that contains the contents you would like to reply with.
3. Optionally, you can also add a `.github/request-info.yml` file if you would like the bot to add a label.

```yml
# Configuration for request-info - https://github.com/behaviorbot/request-info

# Label to be added to Issues and Pull Requests with insufficient information given
labelToAdd: needs-more-info
```

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this plugin.
