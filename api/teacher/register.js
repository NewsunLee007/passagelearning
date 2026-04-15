import teacherHandler from "./[...slug].js";

export default async function handler(req, res) {
  req.query = { ...(req.query ?? {}), slug: ["register"] };
  return teacherHandler(req, res);
}
