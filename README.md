# users
The module managing users

## Env Variables

**Make sure the `.env` file is used in test only.**

## API Service password

To create an APIService password run the following:

```bash
echo -n <password> | sha256sum
```