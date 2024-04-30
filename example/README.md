## Examples of using the OpenFGA JS SDK

A set of Examples on how to call the OpenFGA JS SDK

### Examples
Example 1:
A bare-bones example. It creates a store, and runs a set of calls against it including creating a model, writing tuples and checking for access.

### Running the Examples

Prerequisites:
- `docker`
- `make`
- `Node.js` 16.13.0+

#### Run using a published SDK

Steps
1. Clone/Copy the example folder
2. If you have an OpenFGA server running, you can use it, otherwise run `make run-openfga` to spin up an instance (you'll need to switch to a different terminal after - don't forget to close it when done)
3. Run `make setup` to install dependencies
4. Run `make run` to run the example

#### Run using a local unpublished SDK build

Steps
1. Build the SDK
2. In the Example `package.json` change the `@openfga/sdk` dependency from a semver range like below
```json
"dependencies": {
    "@openfga/sdk": "^0.4.0"
  }
```
to a `file:` reference like below
```json
"dependencies": {
    "@openfga/sdk": "file:../../"
  }
```
3. If you have an OpenFGA server running, you can use it, otherwise run `make run-openfga` to spin up an instance (you'll need to switch to a different terminal after - don't forget to close it when done)
4. Run `make setup` to install dependencies
5. Run `make run` to run the example