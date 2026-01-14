import { verify } from "jsonwebtoken";
import { UNAUTHORIZED } from "../utils/errors";
import { JWT_SECRET } from "../utils/config";

export default (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(UNAUTHORIZED).send({ message: "Authorization required" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(UNAUTHORIZED).send({ message: "Authorization required" });
  }

  req.user = payload;

  return next();
};
