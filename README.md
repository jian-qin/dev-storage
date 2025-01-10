# dev-storage

English | [简体中文](./README.zh-CN.md)

> Managing scripts for custom injections into web pages

## Installation

1. Download the project zip file and unzip it

2. Open Chrome browser and go to `chrome://extensions/`

3. Enable developer mode

4. Click `Load unpacked` and select the unzipped folder

5. Installation successful

## Input box description

| Input box | Description | Example | Required |
| --- | --- | --- | --- |
| `Remark` | Used to identify the name of the script | `xxx - uat` | No |
| `Automatically execute this URL` | Automatically execute when this page is opened | `https://xxx.com/` | No |
| `Script` | Custom script content | `console.log('Hello World!')` | Yes |
| `Redirect to after execution` | The URL to redirect to after executing the script (default is the current URL if not filled in) | `/#/xxx` | No |
