# @mtucourses/frontend

[![codecov](https://codecov.io/gh/Michigan-Tech-Courses/frontend/branch/master/graph/badge.svg?token=IN3VBTZHKH)](https://codecov.io/gh/Michigan-Tech-Courses/frontend)

## 🧰 Development

Copy `.env.example` to `.env` and update as necessary. Then:

```bash
# First:
# install dependencies
yarn install

# then:
# start dev server in watch mode
yarn dev

# and you can:

# run tests
yarn test

# run tests in watch mode
yarn test:watch
```

## 📝 Design Notes

- Ideally, MobX observers would be used to detect when certain properties are being used and automatically figure out which endpoints to load. Unfortunately, this strategy doesn't work when computed properties with `keepAlive` are used (search indices).
