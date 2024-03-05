<img src="public/favicon.ico" height="100" width="100">

# nodejs-boilertemplate

Description of the project goes here.

---

## Setup & usage

**1. Install all dependencies**

```bash
yarn install
```

**2. Start the development server**

```bash
yarn dev
```

**3. Open [http://localhost:4000](http://localhost:4000) with your browser to see if the server is up.**

---

## Naming Conventions

### Classes and Types
When naming classes and types, use PascalCase.

```typescript
class MyClass {
  // ...
}

type MyType = {
  // ...
};
```

### Functions and Variables
When naming functions and variables, use camelCase.

```typescript
const myFunction = () => {
  // ...
};

const myVariable = 0;
```

### Database Columns or Data In/Out
for database columns & response payloads, use snake_case.

```json
{ 
    "first_name": "John",
    "last_name": "Doe"
}
```

---

## API Testing Client

Download and install the latest version of Bruno from [here](https://www.usebruno.com/downloads).

After installing:
- open Bruno
- click on the `+` button to open a new collection
- navigate and select the folder `api-client-doc` in the root directory of the project

You should now see the collection in the Bruno app.

PS: _as you make changes (add or delete) the endpoints, the change is persisted to the `api-client-doc` folder_

---

## Contribution Guide

### Git Contribution

> Perform all your changes on a fork of the base repository.

> Open a pull request once you have completed your changes.

> Don't forget to sync your fork and pull frequently in case any new changes that have been made to the base repository may conflict with your changes.

---

### File Formatting

The same prettier config will be used for code formatting. It should be automatically applied when you use the VS Code prettier extension. If you are using something other than VS Code, try to see if a prettier extension is available for that.

---

_official policy: it is fOrBiddEn to bring down production with your PRs !!_
