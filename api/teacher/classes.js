import teacherHandler from "./[...slug].js";

export default async function handler(req, res) {
  req.query = { ...(req.query ?? {}), slug: ["classes"] };
  return teacherHandler(req, res);
}
