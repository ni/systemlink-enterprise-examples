# Web Application Dev Tools

This folder includes libraries and notes that are helpful for creating custom
SystemLink web applications.

## [ApiServiceProxy](./ApiServiceProxy/)

The [ApiServiceProxy](./ApiServiceProxy/) is used to forward proxy requests to a
SystemLink api. A forward proxy is necessary for web applications using
SystemLink due to the APIs not defining cross origin resource sharing (CORS).

## [deployDistToSL.sh](./deployDistToSL.sh)

Packages and deploys a specified build folder to system link to a specified
workspace. See usage at the top of the [deployDistToSL.sh](./deployDistToSL.sh)
file.

- **Requires** the SystemLink CLI
  ([slcli](https://github.com/ni-kismet/systemlink-cli)) to be installed and in
  profile/log-in saved to the slcli.

Example Usage:

```bash
./publish_webapp.sh <workspace> [dist_dir]
# [dist_dir] defaults to dist if not specified
```
