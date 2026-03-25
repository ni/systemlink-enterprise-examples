# Web App Dev Tools

This folder includes libraries and notes that are helpful for local development of custom
SystemLink web apps.

## [ApiServiceProxy](./ApiServiceProxy/)

The [ApiServiceProxy](./ApiServiceProxy/) is used to forward proxy API requests to a
SystemLink deployment. A forward proxy is necessary during local development for web apps
calling SystemLink APIs due to web apps not allowing cross origin resource sharing (CORS).

## [deployDistToSL.sh](./deployDistToSL.sh)

A script that packages and deploys a specified build folder to SystemLink in a specified
workspace. See usage at the top of the [deployDistToSL.sh](./deployDistToSL.sh)
file.

- **Requires** the SystemLink CLI
  ([slcli](https://github.com/ni-kismet/systemlink-cli)) to be installed and in
  profile/log-in saved to the slcli.

Example Usage:

```bash
./deployDistToSL.sh <workspace> [dist_dir]
# [dist_dir] defaults to dist if not specified
```